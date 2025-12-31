# Hospital AI Assistant - GCP Deployment Script (PowerShell)
# For Windows users

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Hospital AI Assistant - GCP Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
    Write-Host "✅ gcloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ gcloud CLI not found!" -ForegroundColor Red
    Write-Host "Please install: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Get project ID
Write-Host "📋 Step 1: Configure GCP Project" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
$PROJECT_ID = Read-Host "Enter your GCP Project ID"

if ([string]::IsNullOrWhiteSpace($PROJECT_ID)) {
    Write-Host "❌ Project ID cannot be empty" -ForegroundColor Red
    exit 1
}

gcloud config set project $PROJECT_ID
Write-Host "✅ Project set to: $PROJECT_ID" -ForegroundColor Green
Write-Host ""

# Enable APIs
Write-Host "📋 Step 2: Enable Required APIs" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "Enabling Cloud Run, Cloud SQL, Container Registry..."

gcloud services enable `
    run.googleapis.com `
    sqladmin.googleapis.com `
    containerregistry.googleapis.com `
    secretmanager.googleapis.com

Write-Host "✅ APIs enabled" -ForegroundColor Green
Write-Host ""

# Create Cloud SQL instance
Write-Host "📋 Step 3: Create Cloud SQL Instance" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
$CREATE_SQL = Read-Host "Create new Cloud SQL instance? (y/n)"

if ($CREATE_SQL -eq "y") {
    $DB_ROOT_PASSWORD = Read-Host "Enter database root password" -AsSecureString
    $DB_ROOT_PASSWORD_TEXT = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_ROOT_PASSWORD))
    
    $DB_USER_PASSWORD = Read-Host "Enter database user password" -AsSecureString
    $DB_USER_PASSWORD_TEXT = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_USER_PASSWORD))
    
    Write-Host "Creating Cloud SQL instance (this takes 5-10 minutes)..." -ForegroundColor Cyan
    gcloud sql instances create hospital-db-instance `
        --database-version=POSTGRES_16 `
        --tier=db-f1-micro `
        --region=us-central1 `
        --root-password=$DB_ROOT_PASSWORD_TEXT
    
    Write-Host "Creating database..." -ForegroundColor Cyan
    gcloud sql databases create hospital_db `
        --instance=hospital-db-instance
    
    Write-Host "Creating user..." -ForegroundColor Cyan
    gcloud sql users create hospital_user `
        --instance=hospital-db-instance `
        --password=$DB_USER_PASSWORD_TEXT
    
    Write-Host "✅ Cloud SQL instance created" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping Cloud SQL creation" -ForegroundColor Yellow
}
Write-Host ""

# Store secrets
Write-Host "📋 Step 4: Store Secrets" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
$GROQ_KEY = Read-Host "Enter your GROQ API Key" -AsSecureString
$GROQ_KEY_TEXT = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($GROQ_KEY))

$DB_PASSWORD = Read-Host "Enter database password" -AsSecureString
$DB_PASSWORD_TEXT = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

Write-Host "Storing secrets in Secret Manager..." -ForegroundColor Cyan

# Store GROQ API Key
try {
    echo $GROQ_KEY_TEXT | gcloud secrets create groq-api-key --data-file=-
} catch {
    echo $GROQ_KEY_TEXT | gcloud secrets versions add groq-api-key --data-file=-
}

# Store DB Password
try {
    echo $DB_PASSWORD_TEXT | gcloud secrets create db-password --data-file=-
} catch {
    echo $DB_PASSWORD_TEXT | gcloud secrets versions add db-password --data-file=-
}

Write-Host "✅ Secrets stored" -ForegroundColor Green
Write-Host ""

# Build and push image
Write-Host "📋 Step 5: Build and Push Docker Image" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow
Write-Host "Configuring Docker..." -ForegroundColor Cyan
gcloud auth configure-docker

Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t gcr.io/$PROJECT_ID/hospital-ai-assistant:latest .

Write-Host "Pushing to Google Container Registry..." -ForegroundColor Cyan
docker push gcr.io/$PROJECT_ID/hospital-ai-assistant:latest

Write-Host "✅ Image pushed to GCR" -ForegroundColor Green
Write-Host ""

# Get Cloud SQL connection name
try {
    $INSTANCE_CONNECTION_NAME = gcloud sql instances describe hospital-db-instance `
        --format='get(connectionName)' 2>$null
} catch {
    $INSTANCE_CONNECTION_NAME = ""
}

# Deploy to Cloud Run
Write-Host "📋 Step 6: Deploy to Cloud Run" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

if ($INSTANCE_CONNECTION_NAME) {
    Write-Host "Deploying with Cloud SQL connection..." -ForegroundColor Cyan
    gcloud run deploy hospital-ai-assistant `
        --image gcr.io/$PROJECT_ID/hospital-ai-assistant:latest `
        --platform managed `
        --region us-central1 `
        --allow-unauthenticated `
        --add-cloudsql-instances $INSTANCE_CONNECTION_NAME `
        --set-env-vars "DB_HOST=/cloudsql/$INSTANCE_CONNECTION_NAME" `
        --set-env-vars "DB_PORT=5432" `
        --set-env-vars "DB_NAME=hospital_db" `
        --set-env-vars "DB_USER=hospital_user" `
        --update-secrets "DB_PASSWORD=db-password:latest" `
        --update-secrets "GROQ_API_KEY=groq-api-key:latest" `
        --memory 1Gi `
        --cpu 1 `
        --max-instances 10 `
        --port 3000
} else {
    Write-Host "Deploying without Cloud SQL..." -ForegroundColor Cyan
    gcloud run deploy hospital-ai-assistant `
        --image gcr.io/$PROJECT_ID/hospital-ai-assistant:latest `
        --platform managed `
        --region us-central1 `
        --allow-unauthenticated `
        --update-secrets "GROQ_API_KEY=groq-api-key:latest" `
        --memory 1Gi `
        --cpu 1 `
        --max-instances 10 `
        --port 3000
}

Write-Host "✅ Deployed to Cloud Run" -ForegroundColor Green
Write-Host ""

# Get service URL
$SERVICE_URL = gcloud run services describe hospital-ai-assistant `
    --region us-central1 `
    --format='get(status.url)'

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your application is now live at:" -ForegroundColor Green
Write-Host "🌐 $SERVICE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Initialize database schema (if needed)"
Write-Host "2. Test the application"
Write-Host "3. Set up monitoring and alerts"
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  gcloud run services logs read hospital-ai-assistant --region us-central1"
Write-Host ""
Write-Host "Update deployment:" -ForegroundColor Yellow
Write-Host "  .\deploy-gcp.ps1"
Write-Host ""

pause
