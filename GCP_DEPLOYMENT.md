# 🚀 Deploy to Google Cloud Platform (GCP)

Complete guide to deploy your Hospital AI Database Assistant to GCP using Cloud Run and Cloud SQL.

## 📋 Prerequisites

1. **Google Cloud Account** - [Sign up](https://cloud.google.com/free)
2. **gcloud CLI installed** - [Install](https://cloud.google.com/sdk/docs/install)
3. **Docker Desktop running**
4. **Billing enabled** on your GCP project

## 🎯 Deployment Options

### Option 1: Cloud Run + Cloud SQL (Recommended)
- ✅ Fully managed, serverless
- ✅ Auto-scaling
- ✅ Pay per use
- ✅ Built-in HTTPS

### Option 2: Google Kubernetes Engine (GKE)
- For advanced orchestration needs
- More control, more complexity

**This guide covers Option 1 (Cloud Run + Cloud SQL)**

---

## 🚀 Quick Deployment (5 Steps)

### Step 1: Install and Configure gcloud CLI

```bash
# Install gcloud CLI (if not installed)
# Download from: https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init

# Login to your Google account
gcloud auth login

# Set your project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### Step 2: Create Cloud SQL PostgreSQL Instance

```bash
# Create PostgreSQL instance (this takes 5-10 minutes)
gcloud sql instances create hospital-db-instance \
    --database-version=POSTGRES_16 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=YOUR_SECURE_PASSWORD

# Create the database
gcloud sql databases create hospital_db \
    --instance=hospital-db-instance

# Create a user
gcloud sql users create hospital_user \
    --instance=hospital-db-instance \
    --password=YOUR_USER_PASSWORD
```

### Step 3: Build and Push Docker Image to Google Container Registry

```bash
# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker

# Set your project ID
export PROJECT_ID=$(gcloud config get-value project)

# Build the Docker image
docker build -t gcr.io/$PROJECT_ID/hospital-ai-assistant:latest .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/hospital-ai-assistant:latest
```

### Step 4: Deploy to Cloud Run

```bash
# Get Cloud SQL connection name
export INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe hospital-db-instance \
    --format='get(connectionName)')

# Deploy to Cloud Run
gcloud run deploy hospital-ai-assistant \
    --image gcr.io/$PROJECT_ID/hospital-ai-assistant:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
    --set-env-vars "DB_HOST=/cloudsql/$INSTANCE_CONNECTION_NAME" \
    --set-env-vars "DB_PORT=5432" \
    --set-env-vars "DB_NAME=hospital_db" \
    --set-env-vars "DB_USER=hospital_user" \
    --set-secrets "DB_PASSWORD=db-password:latest" \
    --set-secrets "GROQ_API_KEY=groq-api-key:latest" \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10
```

### Step 5: Initialize Database

```bash
# Connect to Cloud SQL and run setup
gcloud sql connect hospital-db-instance --user=hospital_user --database=hospital_db

# Or use Cloud SQL Proxy
./cloud_sql_proxy -instances=$INSTANCE_CONNECTION_NAME=tcp:5432
```

---

## 📝 Detailed Step-by-Step Guide

### 1. Setup GCP Project

#### Create a New Project
```bash
# Create project
gcloud projects create hospital-ai-project --name="Hospital AI Assistant"

# Set as active project
gcloud config set project hospital-ai-project

# Link billing account (required)
gcloud billing accounts list
gcloud billing projects link hospital-ai-project --billing-account=BILLING_ACCOUNT_ID
```

#### Enable Required APIs
```bash
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    containerregistry.googleapis.com \
    artifactregistry.googleapis.com \
    compute.googleapis.com \
    secretmanager.googleapis.com
```

### 2. Setup Cloud SQL Database

#### Create PostgreSQL Instance
```bash
# Production-ready instance
gcloud sql instances create hospital-db-instance \
    --database-version=POSTGRES_16 \
    --tier=db-g1-small \
    --region=us-central1 \
    --backup \
    --backup-start-time=03:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=4 \
    --root-password=YOUR_SECURE_ROOT_PASSWORD

# For development (cheaper)
gcloud sql instances create hospital-db-instance \
    --database-version=POSTGRES_16 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=YOUR_SECURE_ROOT_PASSWORD
```

#### Create Database and User
```bash
# Create database
gcloud sql databases create hospital_db \
    --instance=hospital-db-instance

# Create user
gcloud sql users create hospital_user \
    --instance=hospital-db-instance \
    --password=YOUR_USER_PASSWORD
```

#### Get Connection Details
```bash
# Get instance connection name
gcloud sql instances describe hospital-db-instance \
    --format='get(connectionName)'

# Output: PROJECT_ID:REGION:INSTANCE_NAME
# Example: hospital-ai-project:us-central1:hospital-db-instance
```

### 3. Store Secrets in Secret Manager

```bash
# Create secrets for sensitive data
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-
echo -n "YOUR_GROQ_API_KEY" | gcloud secrets create groq-api-key --data-file=-
echo -n "YOUR_OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=-
echo -n "YOUR_ANTHROPIC_API_KEY" | gcloud secrets create anthropic-api-key --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding db-password \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding groq-api-key \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 4. Build and Push Docker Image

#### Option A: Using Google Container Registry (GCR)
```bash
# Configure Docker
gcloud auth configure-docker

# Get project ID
export PROJECT_ID=$(gcloud config get-value project)

# Build image
docker build -t gcr.io/$PROJECT_ID/hospital-ai-assistant:latest .

# Push to GCR
docker push gcr.io/$PROJECT_ID/hospital-ai-assistant:latest
```

#### Option B: Using Artifact Registry (Recommended)
```bash
# Create repository
gcloud artifacts repositories create hospital-ai-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Hospital AI Assistant Docker images"

# Configure Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build and tag
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/hospital-ai-repo/hospital-ai-assistant:latest .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/$PROJECT_ID/hospital-ai-repo/hospital-ai-assistant:latest
```

### 5. Deploy to Cloud Run

#### Get Cloud SQL Connection Name
```bash
export INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe hospital-db-instance \
    --format='get(connectionName)')

echo $INSTANCE_CONNECTION_NAME
```

#### Deploy with Environment Variables
```bash
gcloud run deploy hospital-ai-assistant \
    --image gcr.io/$PROJECT_ID/hospital-ai-assistant:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
    --set-env-vars "DB_HOST=/cloudsql/$INSTANCE_CONNECTION_NAME" \
    --set-env-vars "DB_PORT=5432" \
    --set-env-vars "DB_NAME=hospital_db" \
    --set-env-vars "DB_USER=hospital_user" \
    --update-secrets "DB_PASSWORD=db-password:latest" \
    --update-secrets "GROQ_API_KEY=groq-api-key:latest" \
    --update-secrets "OPENAI_API_KEY=openai-api-key:latest" \
    --update-secrets "ANTHROPIC_API_KEY=anthropic-api-key:latest" \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80 \
    --port 3000
```

#### Deploy with YAML (Alternative)
Create `service.yaml`:
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: hospital-ai-assistant
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cloudsql-instances: PROJECT_ID:REGION:INSTANCE_NAME
    spec:
      containers:
      - image: gcr.io/PROJECT_ID/hospital-ai-assistant:latest
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          value: /cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
        - name: DB_PORT
          value: "5432"
        - name: DB_NAME
          value: hospital_db
        - name: DB_USER
          value: hospital_user
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-password
              key: latest
        - name: GROQ_API_KEY
          valueFrom:
            secretKeyRef:
              name: groq-api-key
              key: latest
        resources:
          limits:
            memory: 1Gi
            cpu: 1
```

Deploy:
```bash
gcloud run services replace service.yaml --region us-central1
```

### 6. Initialize Database Schema

#### Option A: Using Cloud SQL Proxy
```bash
# Download Cloud SQL Proxy
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud_sql_proxy

# Start proxy
./cloud_sql_proxy -instances=$INSTANCE_CONNECTION_NAME=tcp:5432 &

# Run setup script
DB_HOST=localhost DB_PORT=5432 DB_NAME=hospital_db DB_USER=hospital_user DB_PASSWORD=YOUR_PASSWORD node src/setup-database.js
```

#### Option B: Using Cloud Shell
```bash
# Connect to instance
gcloud sql connect hospital-db-instance --user=hospital_user --database=hospital_db

# Run SQL commands manually or import schema
```

#### Option C: Using Cloud Run Job
```bash
# Deploy a one-time job to initialize database
gcloud run jobs create hospital-db-setup \
    --image gcr.io/$PROJECT_ID/hospital-ai-assistant:latest \
    --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
    --set-env-vars "DB_HOST=/cloudsql/$INSTANCE_CONNECTION_NAME" \
    --set-env-vars "DB_PORT=5432" \
    --set-env-vars "DB_NAME=hospital_db" \
    --set-env-vars "DB_USER=hospital_user" \
    --update-secrets "DB_PASSWORD=db-password:latest" \
    --command "node" \
    --args "src/setup-database.js" \
    --region us-central1

# Execute the job
gcloud run jobs execute hospital-db-setup --region us-central1
```

---

## 🔧 Configuration Updates

### Update Dockerfile for Cloud Run

Your current Dockerfile works, but you can optimize it:

```dockerfile
# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including Cloud SQL connector if needed)
RUN npm install --production

# Copy application files
COPY . .

# Expose the application port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
```

### Update Database Connection for Cloud SQL

Modify `src/config/database.js` to support Cloud SQL Unix socket:

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Cloud Run uses Unix socket for Cloud SQL
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hospital_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  
  // For Cloud SQL Unix socket connections
  ...(process.env.DB_HOST?.startsWith('/cloudsql/') && {
    host: process.env.DB_HOST,
    port: undefined, // Unix socket doesn't use port
  }),
};

const pool = new pg.Pool(config);

export default pool;
```

---

## 📊 Cost Estimation

### Cloud Run
- **Free tier**: 2 million requests/month
- **Pricing**: $0.00002400 per request (after free tier)
- **Memory**: $0.00000250 per GB-second
- **CPU**: $0.00002400 per vCPU-second

### Cloud SQL (db-f1-micro)
- **Instance**: ~$7.67/month
- **Storage**: $0.17/GB/month
- **Backups**: $0.08/GB/month

### Estimated Monthly Cost
- **Development**: $10-20/month
- **Production (low traffic)**: $30-50/month
- **Production (high traffic)**: $100-300/month

---

## 🔍 Monitoring and Logs

### View Logs
```bash
# Cloud Run logs
gcloud run services logs read hospital-ai-assistant --region us-central1 --limit 50

# Follow logs in real-time
gcloud run services logs tail hospital-ai-assistant --region us-central1

# Cloud SQL logs
gcloud sql operations list --instance hospital-db-instance
```

### Monitoring Dashboard
```bash
# Open Cloud Console monitoring
gcloud run services describe hospital-ai-assistant --region us-central1 --format='get(status.url)'
```

---

## 🔐 Security Best Practices

1. **Use Secret Manager** for all sensitive data
2. **Enable VPC Connector** for private networking
3. **Set up IAM roles** properly
4. **Enable Cloud Armor** for DDoS protection
5. **Use HTTPS only** (Cloud Run provides this automatically)
6. **Regular backups** of Cloud SQL
7. **Enable audit logging**

---

## 🚀 Continuous Deployment

### Using Cloud Build

Create `cloudbuild.yaml`:
```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/hospital-ai-assistant:$COMMIT_SHA', '.']
  
  # Push the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/hospital-ai-assistant:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'hospital-ai-assistant'
      - '--image'
      - 'gcr.io/$PROJECT_ID/hospital-ai-assistant:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'

images:
  - 'gcr.io/$PROJECT_ID/hospital-ai-assistant:$COMMIT_SHA'
```

Setup trigger:
```bash
gcloud builds triggers create github \
    --repo-name=YOUR_REPO \
    --repo-owner=YOUR_GITHUB_USERNAME \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml
```

---

## ✅ Verification Checklist

- [ ] gcloud CLI installed and configured
- [ ] GCP project created with billing enabled
- [ ] Required APIs enabled
- [ ] Cloud SQL instance created
- [ ] Database and user created
- [ ] Secrets stored in Secret Manager
- [ ] Docker image built and pushed
- [ ] Cloud Run service deployed
- [ ] Database schema initialized
- [ ] Application accessible via HTTPS URL
- [ ] Environment variables configured
- [ ] Monitoring and logging set up

---

## 🆘 Troubleshooting

### Issue: Cloud Run can't connect to Cloud SQL
**Solution**: Ensure Cloud SQL instance connection name is correct
```bash
gcloud sql instances describe hospital-db-instance --format='get(connectionName)'
```

### Issue: Out of memory errors
**Solution**: Increase memory allocation
```bash
gcloud run services update hospital-ai-assistant --memory 2Gi --region us-central1
```

### Issue: Cold start timeouts
**Solution**: Set minimum instances
```bash
gcloud run services update hospital-ai-assistant --min-instances 1 --region us-central1
```

### Issue: Database connection timeout
**Solution**: Check Cloud SQL authorization
```bash
gcloud sql instances describe hospital-db-instance
```

---

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

---

**Your Hospital AI Assistant is now ready for GCP deployment! 🚀**
