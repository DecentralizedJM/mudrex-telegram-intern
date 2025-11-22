import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { processCommunityMessage } from "../services/geminiService.js"; 
import { DEFAULT_MEMBERS } from "../types.js";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Treat the Telegram group as 1 big chat
const history = [];

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    // Sender identity
    const senderId = String(msg.from.id);
    const senderName = msg.from.username || msg.from.first_name;

    const newMessage = {
      id: String(msg.message_id),
      senderId,
      text: msg.text || "",
      timestamp: new Date(),
    };

    history.push(newMessage);

    // Build members map (Telegram users appear dynamically)
    const members = {
      ...DEFAULT_MEMBERS,
      [senderId]: {
        id: senderId,
        name: senderName,
        isBot: false,
        isAdmin: false,
        color: "text-white",
      },
    };

    const decision = await processCommunityMessage(
      newMessage,
      history,
      members,
      {
        botName: "Mudrex Intern",
        companyName: "Mudrex",
        knowledgeBase: "",
      }
    );

    if (decision.shouldReply && decision.response) {
      await bot.sendMessage(chatId, decision.response, {
        reply_to_message_id: msg.message_id,
      });
    }

  } catch (err) {
    console.error("Bot error:", err);
  }
});
