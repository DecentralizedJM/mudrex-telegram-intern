# Mudrex Telegram Intern Bot 🤖

AI-powered Telegram community assistant for Mudrex using **Gemini 3.0 Pro
## 🚀 Features

✅ **Ultra-Smart Spam Prevention** - Only responds when genuinely needed  
✅ **Scam Detection** - Automatically flags P2P/USDT sellers and tags admins  
✅ **Market Analysis** - Uses Google Search for real-time crypto news  
✅ **Emotional Support** - Empathetic responses during market downturns  
✅ **Rate Limited** - Maximum 50 responses per day (resets daily)  
✅ **Anti-Hallucination** - Tight logic to avoid making up information  

## 📊 Intelligence System

The bot has a **7-tier decision framework**:

1. **SCAM DETECTION** (Critical) - P2P, USDT sellers, VIP signals → Hostile intervention
2. **FINANCIAL ADVICE** - Politely declines + "...but buy BIT anytime 😏"
3. **MARKET ANALYSIS** - Uses Google Search for latest news
4. **EMOTIONAL SUPPORT** - Empathy for panicked traders
5. **DIRECT QUESTIONS** - Answers Mudrex-related queries
6. **UNKNOWN CONTEXT** - Ignores vague/random messages
7. **SUPPORT ROUTING** - Directs to help@mudrex.com

## 🛠️ Setup

### 1. Prerequisites

- Node.js 18+
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Gemini API Key (from [AI Studio](https://aistudio.google.com/app/apikey))

### 2. Installation

```bash
npm install
```

### 3. Configuration

Create `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Bot

```bash
npm run bot
```

Or build and run production:

```bash
npm run build
npm start
```

## 📋 Bot Commands

- `/stats` - View daily response statistics
- `/help` - Show help message

## 🎯 How It Works

```
Telegram Message
    ↓
Pre-Filter (Spam Detection)
    ↓
Check Rate Limit (50/day)
    ↓
Critical Keyword Check (Scams)
    ↓
Direct Engagement Check (Questions)
    ↓
Gemini AI Analysis
    ↓
Decision: Reply or Ignore
```

## 🧠 Anti-Spam Intelligence

The bot **ignores**:
- Short messages (1-3 characters)
- Generic responses ("lol", "ok", "nice")
- Only emojis
- Casual greetings
- Random chatter

The bot **responds to**:
- Scam keywords (always)
- Direct questions about Mudrex
- Market analysis requests
- Emotional distress signals
- Support queries

## ⚙️ Configuration

Edit `bot/index.ts` to customize:

```typescript
const config = {
  botName: "Mudrex Intern",
  companyName: "Mudrex",
  sarcasmLevel: "medium",
  knowledgeBase: DEFAULT_KNOWLEDGE_BASE,
  personaInstructions: DEFAULT_PERSONA,
};
```

Adjust rate limit in `services/geminiService.ts`:

```typescript
const DAILY_RESPONSE_LIMIT = 50; // Change this
```

## 📊 Tech Stack

- **Runtime**: Node.js with TypeScript
- **AI Model**: Gemini 3 Pro
- **Bot Framework**: node-telegram-bot-api
- **Temperature**: 0.2 (precise, low hallucination)
- **Max Tokens**: 500 (concise responses)

## 🔒 Security

- Never gives financial advice
- Doesn't store sensitive data
- Rate-limited to prevent abuse
- Environment variables for secrets

## 📈 Monitoring

Check bot stats in real-time:

```bash
# In Telegram chat
/stats
```

Console logs show:
- Every message received
- Filter decisions
- Response count
- Reasoning for each action

## 🚀 Deployment

### Railway / Heroku / Render

1. Push to GitHub
2. Connect repo to hosting service
3. Add environment variables
4. Deploy!

### PM2 (VPS)

```bash
npm install -g pm2
npm run build
pm2 start dist/bot/index.js --name mudrex-bot
pm2 save
pm2 startup
```

## 👨‍💻 Author

Created by **@DecentralizedJM**

## 📄 License

MIT

---

**Note**: This bot is designed for the Mudrex community. Modify `types.ts` and `bot/index.ts` to adapt for other use cases.
