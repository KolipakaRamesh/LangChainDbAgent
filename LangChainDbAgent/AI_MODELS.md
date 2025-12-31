# 🤖 AI Model Selection Guide

## Available AI Models

Your Hospital Database Assistant now supports **multiple AI models** from different providers!

### 🆓 Free Models (Groq - No API Key Required)

These models are **free** and use your existing `GROQ_API_KEY`:

1. **LLaMA 3.3 70B** (Default) ⭐
   - Model: `llama-3.3-70b`
   - Best for: Complex queries, detailed analysis
   - Speed: Fast
   - Quality: Excellent

2. **LLaMA 3.1 8B**
   - Model: `llama-3.1-8b`
   - Best for: Quick queries, simple questions
   - Speed: Ultra-fast
   - Quality: Good

3. **Mixtral 8x7B**
   - Model: `mixtral-8x7b`
   - Best for: Balanced performance
   - Speed: Fast
   - Quality: Very Good

4. **Gemma 7B**
   - Model: `gemma-7b`
   - Best for: Google-optimized tasks
   - Speed: Fast
   - Quality: Good

### 💰 Paid Models (Require Additional API Keys)

To use these models, add the respective API keys to your `.env` file:

5. **GPT-4** (OpenAI)
   - Model: `gpt-4`
   - Requires: `OPENAI_API_KEY`
   - Best for: Most complex reasoning
   - Cost: ~$0.03 per 1K tokens

6. **GPT-3.5 Turbo** (OpenAI)
   - Model: `gpt-3.5`
   - Requires: `OPENAI_API_KEY`
   - Best for: Fast, affordable queries
   - Cost: ~$0.001 per 1K tokens

7. **Claude 3 Sonnet** (Anthropic)
   - Model: `claude-3`
   - Requires: `ANTHROPIC_API_KEY`
   - Best for: Balanced performance
   - Cost: ~$0.003 per 1K tokens

## 🚀 How to Use

### Option 1: Using the Web UI

1. Start the AI-powered server:
   ```bash
   npm run start-ai
   ```

2. Open http://localhost:3000

3. Select your model from the **🤖 AI Model** dropdown

4. Ask your question and click **Send Query**

### Option 2: Using the API

```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Show me all patients",
    "model": "llama-3.3-70b"
  }'
```

## 🔑 Setting Up Paid Models

### For OpenAI (GPT-4, GPT-3.5):

1. Get API key from https://platform.openai.com/api-keys

2. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-...your-key-here
   ```

3. Restart server: `npm run start-ai`

### For Anthropic (Claude):

1. Get API key from https://console.anthropic.com/

2. Add to `.env`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...your-key-here
   ```

3. Restart server: `npm run start-ai`

## 📊 Model Comparison

| Model | Provider | Speed | Quality | Cost | Best For |
|-------|----------|-------|---------|------|----------|
| LLaMA 3.3 70B | Groq | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | FREE | General use |
| LLaMA 3.1 8B | Groq | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | FREE | Quick queries |
| Mixtral 8x7B | Groq | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | FREE | Balanced |
| Gemma 7B | Groq | ⚡⚡⚡⚡ | ⭐⭐⭐ | FREE | Google tasks |
| GPT-4 | OpenAI | ⚡⚡ | ⭐⭐⭐⭐⭐ | $$$ | Complex reasoning |
| GPT-3.5 | OpenAI | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $ | Fast & cheap |
| Claude 3 | Anthropic | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$ | Balanced premium |

## 🎯 Recommendations

- **Start with LLaMA 3.3 70B** - Best free option
- **Need speed?** Use LLaMA 3.1 8B
- **Have budget?** Try GPT-4 for complex queries
- **Cost-conscious?** GPT-3.5 is affordable and good

## 🔄 Switching Between Servers

### Simple Server (Keyword-based, No AI)
```bash
npm start
```
- No AI model needed
- Instant responses
- Basic keyword matching
- Free, no API keys required

### AI-Powered Server (LangChain with Multiple Models)
```bash
npm run start-ai
```
- Uses AI models for intelligent responses
- Requires GROQ_API_KEY (free)
- Optional: OPENAI_API_KEY, ANTHROPIC_API_KEY
- Smarter, context-aware responses

## 💡 Tips

1. **Free tier is powerful** - Groq models are excellent and free
2. **Test different models** - Each has strengths
3. **Monitor costs** - If using paid models, track usage
4. **Start simple** - Use free models first, upgrade if needed

---

**Enjoy experimenting with different AI models!** 🚀
