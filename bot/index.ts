import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { processCommunityMessage, getDailyStats } from "../services/geminiService.js";
import { DEFAULT_KNOWLEDGE_BASE, DEFAULT_PERSONA } from "../types.js";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate environment
if (!BOT_TOKEN || !GEMINI_API_KEY) {
  console.error("❌ MISSING ENVIRONMENT VARIABLES");
  console.error("Please create a .env file with:");
  console.error("  TELEGRAM_BOT_TOKEN=your_telegram_bot_token");
  console.error("  GEMINI_API_KEY=your_gemini_api_key");
  process.exit(1);
}

console.log("🚀 Mudrex Intern Bot Starting...");
console.log("📊 Model: gemini-3-pro-preview");
console.log("🎯 Daily Limit: 50 responses");

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Message history (in-memory, last 20 messages per chat)
const chatHistories: Record<string, any[]> = {};
const MAX_HISTORY = 20;

// Track unique members per chat
const chatMembers: Record<string, Record<string, any>> = {};

// Bot config
const config = {
  botName: "Mudrex Intern",
  companyName: "Mudrex",
  sarcasmLevel: "medium" as const,
  knowledgeBase: DEFAULT_KNOWLEDGE_BASE,
  personaInstructions: DEFAULT_PERSONA,
};

// Stats command
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const stats = getDailyStats();
  
  const statsMessage = `
📊 *Mudrex Intern Bot Stats*

✅ Responses Today: ${stats.responsesToday}/${stats.limit}
⏳ Remaining: ${stats.remaining}
🔄 Last Reset: ${stats.lastReset}
🤖 Model: gemini-3-pro-preview
  `;
  
  await bot.sendMessage(chatId, statsMessage, { parse_mode: "Markdown" });
});

// Help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
🤖 *Mudrex Intern Bot*

I'm your 200 IQ crypto community assistant.

*What I Do:*
✅ Detect & report scams (P2P, USDT sellers)
✅ Answer Mudrex questions
✅ Provide market analysis (with Google Search)
✅ Support emotional traders
❌ Never give financial advice (except: buy BIT!)

*Commands:*
/stats - View daily usage stats
/help - Show this message

*Created by:* @DecentralizedJM
  `;
  
  await bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
});

// Main message handler
bot.on("message", async (msg) => {
  try {
    // Ignore commands
    if (msg.text?.startsWith("/")) return;
    
    const chatId = msg.chat.id.toString();
    const senderId = msg.from?.id.toString() || "unknown";
    const senderName = msg.from?.username || msg.from?.first_name || "Unknown";
    
    // Initialize chat history if needed
    if (!chatHistories[chatId]) {
      chatHistories[chatId] = [];
    }
    
    if (!chatMembers[chatId]) {
      chatMembers[chatId] = {};
    }
    
    // Add sender to members
    chatMembers[chatId][senderId] = {
      id: senderId,
      name: senderName,
      isBot: msg.from?.is_bot || false,
      isAdmin: false,
      color: "text-white",
    };
    
    // Build message object
    const newMessage = {
      id: msg.message_id.toString(),
      senderId,
      text: msg.text || msg.caption || "",
      timestamp: new Date(msg.date * 1000),
    };
    
    // Add to history (keep last 20)
    chatHistories[chatId].push(newMessage);
    if (chatHistories[chatId].length > MAX_HISTORY) {
      chatHistories[chatId].shift();
    }
    
    console.log(`\n📨 [${chatId}] ${senderName}: ${newMessage.text}`);
    
    // Process with Gemini
    const decision = await processCommunityMessage(
      newMessage,
      chatHistories[chatId],
      chatMembers[chatId],
      config
    );
    
    if (decision.shouldReply && decision.response) {
      console.log(`✅ Replying: ${decision.response}`);
      
      await bot.sendMessage(chatId, decision.response, {
        reply_to_message_id: msg.message_id,
        parse_mode: "Markdown",
      });
    } else {
      console.log(`⏭️  Skipped: ${decision.reasoning}`);
    }
    
  } catch (error: any) {
    console.error("❌ Bot Error:", error.message);
  }
});

// Error handling
bot.on("polling_error", (error) => {
  console.error("❌ Polling Error:", error.message);
});

console.log("✅ Bot is running! Listening for messages...");
console.log("💡 Use Ctrl+C to stop\n");
