# 🐳 Docker Deployment Guide

Complete guide to deploy the Hospital AI Database Assistant using Docker.

## 📋 Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- Your API keys ready (at least GROQ_API_KEY)

## 🚀 Quick Start

### 1. Clone/Navigate to Project
```bash
cd d:\Development\LangChainDbAgent
```

### 2. Create Environment File
Copy `.env.example` to `.env` and add your credentials:

```env
# Database Configuration (Docker will use these)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=postgres123

# Required: Groq API Key (Free)
GROQ_API_KEY=your_groq_api_key_here

# Optional: Premium AI Models
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Optional: LangChain Tracing
LANGCHAIN_API_KEY=your_langchain_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=hospital-ai-assistant
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

This will:
- ✅ Pull PostgreSQL 16 image
- ✅ Build the Node.js application
- ✅ Create the database
- ✅ Initialize tables and sample data
- ✅ Start the web server

### 4. Access the Application
Open your browser to: **http://localhost:3000**

## 📦 Docker Commands

### Start Services
```bash
# Start in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Rebuild and start (after code changes)
docker-compose up -d --build
```

### Stop Services
```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f postgres
```

### Database Management
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d hospital_db

# Run SQL commands
docker-compose exec postgres psql -U postgres -d hospital_db -c "SELECT * FROM patients;"

# Backup database
docker-compose exec postgres pg_dump -U postgres hospital_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres hospital_db < backup.sql
```

### Application Management
```bash
# Restart app only
docker-compose restart app

# View app logs
docker-compose logs -f app

# Execute commands in app container
docker-compose exec app sh

# Reinitialize database
docker-compose exec app npm run setup-db
```

## 🔧 Configuration

### Environment Variables

The `docker-compose.yml` uses environment variables from your `.env` file:

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_PASSWORD` | No | Database password (default: postgres123) |
| `GROQ_API_KEY` | Yes* | Groq API key for free AI models |
| `OPENAI_API_KEY` | No | OpenAI API key for GPT models |
| `ANTHROPIC_API_KEY` | No | Anthropic API key for Claude |
| `LANGCHAIN_API_KEY` | No | LangSmith tracing (optional) |

*Required for AI features. App works without it in simple mode.

### Ports

- **3000** - Web application
- **5432** - PostgreSQL database

To change ports, edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Access app on port 8080
```

### Persistent Data

Database data is stored in a Docker volume named `postgres_data`. This persists even when containers are stopped.

To reset the database:
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d    # Recreates fresh database
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Browser (localhost:3000)          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   hospital-ai-assistant (Node.js)   │
│   - Express server                  │
│   - LangChain AI agent              │
│   - Multi-model support             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   hospital-db (PostgreSQL 16)       │
│   - hospital_db database            │
│   - Sample patient data             │
└─────────────────────────────────────┘
```

## 🐋 Building for Production

### Build Image Only
```bash
docker build -t hospital-ai-assistant .
```

### Run Without Docker Compose
```bash
# Start PostgreSQL
docker run -d \
  --name hospital-db \
  -e POSTGRES_DB=hospital_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  postgres:16-alpine

# Start Application
docker run -d \
  --name hospital-ai-assistant \
  --link hospital-db:postgres \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=postgres123 \
  -e GROQ_API_KEY=your_key \
  -p 3000:3000 \
  hospital-ai-assistant
```

### Push to Docker Hub
```bash
# Tag image
docker tag hospital-ai-assistant yourusername/hospital-ai-assistant:latest

# Login to Docker Hub
docker login

# Push image
docker push yourusername/hospital-ai-assistant:latest
```

### Deploy to Cloud

**Docker Hub:**
```bash
docker tag hospital-ai-assistant yourusername/hospital-ai-assistant:v1.0
docker push yourusername/hospital-ai-assistant:v1.0
```

**AWS ECR:**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag hospital-ai-assistant your-account.dkr.ecr.us-east-1.amazonaws.com/hospital-ai-assistant:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/hospital-ai-assistant:latest
```

## 🔍 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Check if ports are available
netstat -an | findstr "3000"
netstat -an | findstr "5432"
```

### Database connection failed
```bash
# Verify database is healthy
docker-compose ps

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d hospital_db -c "SELECT 1;"
```

### App can't connect to database
```bash
# Ensure DB_HOST is set to 'postgres' (service name)
# Restart app after database is ready
docker-compose restart app
```

### Reset everything
```bash
# Nuclear option - removes all containers, networks, and volumes
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📊 Monitoring

### Check Container Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

### Health Checks
```bash
# Database health
docker-compose exec postgres pg_isready -U postgres

# App health (check if responding)
curl http://localhost:3000
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use strong database passwords** - Change default `postgres123`
3. **Limit exposed ports** - Only expose what's needed
4. **Keep images updated** - Regularly update base images
5. **Use secrets in production** - Docker secrets or environment-specific configs

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🎯 Next Steps

1. ✅ Start containers: `docker-compose up -d`
2. ✅ Open browser: http://localhost:3000
3. ✅ Select an AI model
4. ✅ Try sample queries
5. ✅ Monitor with: `docker-compose logs -f`

---

**Need Help?** Check the main [README.md](README.md) for application usage guide.
