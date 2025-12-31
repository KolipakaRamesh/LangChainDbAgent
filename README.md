# 🏥 Hospital AI Database Assistant

AI-powered database assistant with **multiple AI models** and a beautiful web interface. Query patient information, appointments, doctor details, and medical records using natural language.

## 🌐 Live Demo

**Try it now:** [https://hospital-ai-assistant-387802257811.us-central1.run.app](https://hospital-ai-assistant-387802257811.us-central1.run.app)

[![Deployed on Google Cloud](https://img.shields.io/badge/Deployed%20on-Google%20Cloud-4285F4?logo=google-cloud&logoColor=white)](https://hospital-ai-assistant-387802257811.us-central1.run.app)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/)
[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-Active-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/run)

## ✨ Features

- 🤖 **7 AI Models** - Choose from LLaMA, Mixtral, Gemma, GPT-4, GPT-3.5, Claude
- 🎨 **Modern Web UI** - Bright, clean interface with tabbed layout
- 💬 **Natural Language** - Ask questions in plain English
- 🔌 **MCP Support** - Model Context Protocol for Claude Desktop
- 📊 **Real-time Stats** - Live query metrics and success rates
- 🔍 **Activity Monitor** - See every database call in real-time
- ⚡ **Quick Queries** - One-click common operations

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Configure
Create `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=your_password

# Required for AI models
GROQ_API_KEY=your_groq_key

# Optional for premium models
# OPENAI_API_KEY=sk-your-openai-key
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

### 3. Setup Database
```bash
# Create database (using pgAdmin or psql)
CREATE DATABASE hospital_db;

# Initialize tables and data
npm run setup-db
```

### 4. Start Server

```bash
npm start
```

The server automatically detects available features:
- ✅ **With GROQ_API_KEY**: Full AI mode with 7 models
- ⚡ **Without API key**: Fast keyword-based mode

Open **http://localhost:3000**

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# 1. Create .env file with your API keys
cp .env.example .env

# 2. Start everything with Docker Compose
docker-compose up -d

# 3. Open browser
# http://localhost:3000
```

That's it! Docker will:
- ✅ Set up PostgreSQL database
- ✅ Initialize tables and sample data
- ✅ Start the web application
- ✅ Handle all dependencies

**See [DOCKER.md](DOCKER.md) for complete Docker guide** including:
- Detailed commands
- Troubleshooting
- Production deployment
- Cloud deployment (Docker Hub, AWS ECR)

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart
docker-compose restart

# Reset database
docker-compose down -v && docker-compose up -d
```

## ☁️ Cloud Deployment (GCP)

### ✅ Currently Deployed

**Live URL:** [https://hospital-ai-assistant-387802257811.us-central1.run.app](https://hospital-ai-assistant-387802257811.us-central1.run.app)

- **Platform:** Google Cloud Run
- **Region:** us-central1
- **Status:** Active
- **Features:** Auto-scaling, HTTPS, Secrets Management

### Deploy Your Own Instance

```powershell
# Windows - Automated deployment
.\deploy-gcp.ps1
```

**What you get:**
- ✅ Fully managed Cloud Run service
- ✅ Auto-scaling (0 to N instances)
- ✅ HTTPS with custom domain support
- ✅ Secrets management (Secret Manager)
- ✅ Built-in monitoring and logging
- ✅ 99.95% uptime SLA

**See detailed guide:** [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md)

### Manual GCP Deployment

```bash
# 1. Build and push to Google Container Registry
export PROJECT_ID=$(gcloud config get-value project)
docker build -t gcr.io/$PROJECT_ID/hospital-ai-assistant:latest .
docker push gcr.io/$PROJECT_ID/hospital-ai-assistant:latest

# 2. Store GROQ API Key
echo -n "YOUR_GROQ_API_KEY" | gcloud secrets create groq-api-key --data-file=-

# 3. Deploy to Cloud Run
gcloud run deploy hospital-ai-assistant \
    --image gcr.io/$PROJECT_ID/hospital-ai-assistant:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --update-secrets "GROQ_API_KEY=groq-api-key:latest"
```

**Estimated Cost:** $1-10/month (mostly free tier for low traffic)

## 🤖 AI Models

### Free Models (Groq)
- **LLaMA 3.3 70B** - Fast, powerful (Default) ⭐
- **LLaMA 3.1 8B** - Ultra-fast
- **Mixtral 8x7B** - Balanced
- **Gemma 7B** - Google-optimized

### Premium Models (Require API Keys)
- **GPT-4** - Most capable (OpenAI)
- **GPT-3.5 Turbo** - Fast & affordable (OpenAI)
- **Claude 3 Sonnet** - Balanced (Anthropic)

See `AI_MODELS.md` for detailed comparison and setup.

## 🎨 Web Interface

### Tabbed Layout
- **📊 Response Tab** - Query results in smart tables
- **🔌 MCP Activity Tab** - Real-time API call logs
- **Stats Bar** - Queries, success rate, avg response time

### Model Selection
- Dropdown to choose AI model
- Free models ready to use
- Premium models available with API keys

### Quick Queries
- 👥 All Patients
- 👨‍⚕️ All Doctors  
- 📅 Appointments
- ❤️ Cardiologists

### Custom Queries
Type your own questions:
- "Find patient named Sarah"
- "Show me doctors specializing in pediatrics"
- "What appointments are scheduled for December 28?"
- "Get medical records for patient ID 1"

## 🔌 Claude Desktop Integration

Add to Claude Desktop config:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "hospital-database": {
      "command": "node",
      "args": ["d:/Development/LangChainDbAgent/src/mcp/database-mcp-server.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "hospital_db",
        "DB_USER": "postgres",
        "DB_PASSWORD": "your_password"
      }
    }
  }
}
```

Restart Claude Desktop to use database tools directly!

## 🗄️ Database Schema

- **patients** - Patient records (ID, name, age, gender, contact)
- **doctors** - Doctor details (ID, name, specialization, experience)
- **appointments** - Appointment records (patient, doctor, date, status)
- **medical_records** - Medical history (diagnosis, treatment, prescriptions)

## 📝 Scripts

```bash
npm start        # Start server (auto-detects AI availability)
npm run dev      # Start with auto-reload
npm run setup-db # Initialize database
```

**Server Modes:**
- With `GROQ_API_KEY`: AI-powered with model selection
- Without API key: Fast keyword-based queries

## 📁 Project Structure

```
LangChainDbAgent/
│
├── 📄 Configuration
│   ├── .env                    # Your credentials (gitignored)
│   ├── .env.example           # Template
│   ├── package.json           # Dependencies & scripts
│   └── mcp-config.json        # MCP server config
│
├── 🛠️ Setup Scripts
│   ├── create-database.ps1    # Create PostgreSQL database
│   └── setup-env.bat          # Create .env file
│
├── 🎨 Frontend (public/)
│   └── index.html             # Complete web UI
│                              # - Tabbed interface
│                              # - Model selector
│                              # - Real-time stats
│
└── ⚙️ Backend (src/)
    │
    ├── config/
    │   └── database.js        # PostgreSQL connection
    │
    ├── mcp/
    │   └── database-mcp-server.js  # MCP server (6 tools)
    │
    ├── tools/
    │   └── database-tools.js  # LangChain tool definitions
    │
    ├── agent/
    │   └── multi-model-agent.js    # Multi-model support
    │
    ├── server.js              # ⭐ Unified server (AI + Simple)
    └── setup-database.js      # Database initialization
```

### 🔑 Key Files

| File | Purpose |
|------|---------|
| **public/index.html** | Complete web UI with tabs & model selector |
| **src/server.js** | Unified server (AI + simple modes) ⭐ |
| **src/agent/multi-model-agent.js** | Multi-model AI agent |
| **src/mcp/database-mcp-server.js** | MCP server for Claude Desktop |
| **src/setup-database.js** | One-time database setup |

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **AI**: LangChain + Groq/OpenAI/Anthropic
- **MCP**: Model Context Protocol
- **Frontend**: Vanilla JavaScript (single-file UI)

## 🔒 Security

- Environment variables for credentials
- Parameterized SQL queries (SQL injection protection)
- MCP isolation layer
- No data invention policy

## 📚 Documentation

### Core Documentation
- **[README.md](README.md)** - Main documentation (this file)
- **[AI_MODELS.md](AI_MODELS.md)** - Complete guide to all 7 AI models
- **.env.example** - Environment variable template

### Deployment Guides
- **[DOCKER.md](DOCKER.md)** - Complete Docker deployment guide
- **[GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md)** - Google Cloud Platform deployment

### Scripts
- **deploy-docker.bat** - Quick Docker deployment (Windows)
- **deploy-gcp.ps1** - Quick GCP deployment (Windows)
- **setup-env.bat** - Environment setup helper

## 🎯 Example Queries

**Patients:**
- "Show me all patients"
- "Find patient named Sarah"
- "Get patient with ID 1"

**Doctors:**
- "List all doctors"
- "Who are the cardiologists?"
- "Show me doctors specializing in pediatrics"

**Appointments:**
- "Show all appointments"
- "What appointments does patient ID 1 have?"
- "Show appointments for December 28, 2025"

**Medical Records:**
- "Get medical records for patient ID 1"
- "What is the diagnosis for patient John Smith?"

## 📄 License

ISC

---

**Get API Keys:**
- Groq (Free): https://console.groq.com
- OpenAI (Paid): https://platform.openai.com/api-keys
- Anthropic (Paid): https://console.anthropic.com
- LangSmith (Optional): https://smith.langchain.com

##  Deployment Options

### 1. Local Development
```bash
npm install
npm run setup-db
npm start
# Access: http://localhost:3000
```

### 2. Docker (Local)
```bash
docker-compose up -d
# Access: http://localhost:3000
```

### 3. Google Cloud Platform (Production)
```powershell
.\deploy-gcp.ps1
# Access: Your Cloud Run URL
```

**Live Demo:** [https://hospital-ai-assistant-387802257811.us-central1.run.app](https://hospital-ai-assistant-387802257811.us-central1.run.app)

---

##  Resources

**Documentation:**
- [Docker Deployment Guide](DOCKER.md)
- [GCP Deployment Guide](GCP_DEPLOYMENT.md)
- [AI Models Guide](AI_MODELS.md)

**Cloud Platforms:**
- [Google Cloud Console](https://console.cloud.google.com)
- [Cloud Run Dashboard](https://console.cloud.google.com/run)

---

**Made with  using LangChain, Node.js, and PostgreSQL**

**Live Demo:** [Try it now ](https://hospital-ai-assistant-387802257811.us-central1.run.app)
