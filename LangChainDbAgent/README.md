# 🏥 Hospital AI Database Assistant

AI-powered database assistant with **multiple AI models** and a beautiful web interface. Query patient information, appointments, doctor details, and medical records using natural language.

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

- **AI_MODELS.md** - Complete guide to all 7 AI models
- **README.md** - This file (main documentation)
- **.env.example** - Environment variable template

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
