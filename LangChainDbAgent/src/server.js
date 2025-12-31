import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, executeQuery } from './config/database.js';
import { queryAgentWithModel, getAvailableModels } from './agent/multi-model-agent.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Check if AI is available
const AI_AVAILABLE = !!process.env.GROQ_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        aiAvailable: AI_AVAILABLE,
        timestamp: new Date().toISOString(),
    });
});

// Get available models
app.get('/models', (req, res) => {
    try {
        if (!AI_AVAILABLE) {
            return res.json({
                models: [],
                message: 'AI not available. Add GROQ_API_KEY to .env to enable AI features.'
            });
        }
        const models = getAvailableModels();
        res.json({ models });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get models',
            message: error.message,
        });
    }
});

// Unified query endpoint (AI or simple keyword-based)
app.post('/query', async (req, res) => {
    try {
        const { question, model } = req.body;

        if (!question) {
            return res.status(400).json({
                error: 'Question is required',
            });
        }

        console.log(`\n📥 Received question: ${question}`);

        let answer;

        // Use AI if model is specified and AI is available
        if (model && AI_AVAILABLE) {
            console.log(`🤖 Using AI model: ${model}`);
            try {
                answer = await queryAgentWithModel(question, model);
            } catch (aiError) {
                console.error('AI query failed, falling back to simple mode:', aiError.message);
                answer = await simpleQuery(question);
            }
        } else {
            // Fall back to simple keyword-based routing
            console.log('🔍 Using simple keyword matching');
            answer = await simpleQuery(question);
        }

        res.json({
            question,
            answer: typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2),
            model: model || 'simple',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({
            error: 'Failed to process query',
            message: error.message,
        });
    }
});

// Simple keyword-based query function
async function simpleQuery(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('patient')) {
        return await executeQuery('SELECT * FROM patients LIMIT 10');
    } else if (lowerQuestion.includes('doctor') || lowerQuestion.includes('cardiologist') || lowerQuestion.includes('specialist')) {
        // Check if asking for specific specialization
        if (lowerQuestion.includes('cardiologist') || lowerQuestion.includes('cardiology')) {
            return await executeQuery("SELECT * FROM doctors WHERE LOWER(specialization) LIKE '%cardio%'");
        } else if (lowerQuestion.includes('pediatric') || lowerQuestion.includes('pediatrician')) {
            return await executeQuery("SELECT * FROM doctors WHERE LOWER(specialization) LIKE '%pediatric%'");
        } else if (lowerQuestion.includes('neurolog')) {
            return await executeQuery("SELECT * FROM doctors WHERE LOWER(specialization) LIKE '%neuro%'");
        } else if (lowerQuestion.includes('orthopedic')) {
            return await executeQuery("SELECT * FROM doctors WHERE LOWER(specialization) LIKE '%orthopedic%'");
        } else {
            return await executeQuery('SELECT * FROM doctors');
        }
    } else if (lowerQuestion.includes('appointment')) {
        return await executeQuery(`
            SELECT a.*, p.name as patient_name, d.name as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.patient_id
            LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
            LIMIT 10
        `);
    } else {
        return { message: 'Please ask about patients, doctors, or appointments' };
    }
}

// Start server
async function startServer() {
    console.log('🔍 Testing database connection...');
    const connected = await testConnection();

    if (!connected) {
        console.error('\n⚠️  Warning: Database connection failed!');
        console.log('Please ensure:');
        console.log('  1. PostgreSQL is running');
        console.log('  2. Database "hospital_db" exists');
        console.log('  3. Credentials in .env are correct\n');
    }

    app.listen(PORT, () => {
        console.log(`\n🚀 Hospital Database Assistant Server`);
        console.log(`─`.repeat(60));
        console.log(`📍 Server running on: http://localhost:${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`💬 Query endpoint: POST http://localhost:${PORT}/query`);

        if (AI_AVAILABLE) {
            console.log(`🤖 AI Mode: ENABLED`);
            console.log(`📊 Models endpoint: GET http://localhost:${PORT}/models`);
            console.log(`─`.repeat(60));
            console.log(`\n💡 Available AI Models:`);
            const models = getAvailableModels();
            models.forEach(m => {
                console.log(`   - ${m.name}: ${m.description}`);
            });
        } else {
            console.log(`🔍 AI Mode: DISABLED (add GROQ_API_KEY to enable)`);
            console.log(`─`.repeat(60));
            console.log(`\n💡 Running in simple keyword mode`);
            console.log(`   Add GROQ_API_KEY to .env to enable AI features`);
        }
        console.log(`\n`);
    });
}

startServer();
