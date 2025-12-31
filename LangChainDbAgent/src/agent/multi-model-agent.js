import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { databaseTools } from '../tools/database-tools.js';
import dotenv from 'dotenv';

dotenv.config();

// System prompt for the hospital assistant
const systemPrompt = `You are an AI database assistant for a hospital management system.

Your role is to help users retrieve information from the hospital database safely and accurately.

RULES:
1. ONLY use the provided tools to access database information
2. NEVER assume or invent data - if a record is not found, clearly state so
3. When a tool returns "No records found", inform the user that the information is not available
4. Be concise and clear in your responses
5. Protect patient privacy - only share information when explicitly requested
6. If you need more information to answer a question, ask the user for clarification
7. Do NOT explain the database queries or technical details unless asked
8. Format your responses in a user-friendly way

AVAILABLE INFORMATION:
- Patient information (ID, name, age, gender, contact, admission date)
- Doctor information (ID, name, specialization, contact)
- Appointments (patient, doctor, date, time, status)
- Medical records (diagnosis, treatment, prescriptions)

When answering questions:
- Use the appropriate tool based on what information is requested
- If multiple tools are needed, use them sequentially
- Always verify data exists before presenting it
- Present information in a clear, organized format

Remember: Accuracy and data safety are your top priorities.`;

// Create the prompt template
const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['placeholder', '{chat_history}'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
]);

// Available models configuration
const MODELS = {
    // Groq models (fast and free)
    'llama-3.3-70b': {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        name: 'LLaMA 3.3 70B',
        description: 'Fast, powerful, free'
    },
    'llama-3.1-8b': {
        provider: 'groq',
        model: 'llama-3.1-8b-instant',
        name: 'LLaMA 3.1 8B',
        description: 'Ultra-fast, free'
    },
    'mixtral-8x7b': {
        provider: 'groq',
        model: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Balanced, free'
    },
    'gemma-7b': {
        provider: 'groq',
        model: 'gemma-7b-it',
        name: 'Gemma 7B',
        description: 'Google, free'
    },
    // OpenAI models (requires API key)
    'gpt-4': {
        provider: 'openai',
        model: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable (paid)'
    },
    'gpt-3.5': {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast, affordable'
    },
    // Anthropic models (requires API key)
    'claude-3': {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        description: 'Balanced (paid)'
    }
};

// Create LLM instance based on model selection
function createLLM(modelKey) {
    const config = MODELS[modelKey];
    if (!config) {
        throw new Error(`Unknown model: ${modelKey}`);
    }

    const baseConfig = {
        temperature: 0,
        maxTokens: 2000,
    };

    switch (config.provider) {
        case 'groq':
            return new ChatGroq({
                apiKey: process.env.GROQ_API_KEY,
                model: config.model,
                ...baseConfig
            });
        case 'openai':
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('OPENAI_API_KEY not configured');
            }
            return new ChatOpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                model: config.model,
                ...baseConfig
            });
        case 'anthropic':
            if (!process.env.ANTHROPIC_API_KEY) {
                throw new Error('ANTHROPIC_API_KEY not configured');
            }
            return new ChatAnthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
                model: config.model,
                ...baseConfig
            });
        default:
            throw new Error(`Unknown provider: ${config.provider}`);
    }
}

// Create agent executor for a specific model
async function createAgentForModel(modelKey) {
    const llm = createLLM(modelKey);

    const agent = await createToolCallingAgent({
        llm,
        tools: databaseTools,
        prompt,
    });

    return new AgentExecutor({
        agent,
        tools: databaseTools,
        verbose: true,
        maxIterations: 5,
        handleParsingErrors: true,
    });
}

// Query the agent with a specific model
export async function queryAgentWithModel(question, modelKey = 'llama-3.3-70b') {
    try {
        console.log(`\n🤖 Processing question with ${MODELS[modelKey]?.name || modelKey}:`, question);
        console.log('─'.repeat(60));

        const agentExecutor = await createAgentForModel(modelKey);

        const result = await agentExecutor.invoke({
            input: question,
        });

        console.log('─'.repeat(60));
        console.log('✅ Response:', result.output);
        console.log('─'.repeat(60) + '\n');

        return result.output;
    } catch (error) {
        console.error('❌ Error querying agent:', error.message);
        throw error;
    }
}

// Get available models
export function getAvailableModels() {
    return Object.entries(MODELS).map(([key, config]) => ({
        id: key,
        name: config.name,
        description: config.description,
        provider: config.provider
    }));
}

// Cleanup function
export async function cleanup() {
    console.log('🔌 Agent cleanup complete');
}

export default { queryAgentWithModel, getAvailableModels, cleanup };
