/**
 * Mudrex Telegram Intern Bot - Proprietary Software
 * 
 * Copyright (c) 2025 DecentralizedJM
 * GitHub: https://github.com/DecentralizedJM
 * 
 * All Rights Reserved. This file is protected intellectual property.
 * Unauthorized modification, distribution, or reverse-engineering is prohibited.
 * 
 * Creator: @DecentralizedJM
 * License: See LICENSE file in the project root
 * 
 * CRITICAL: The AI personality and decision logic in this file are 
 * proprietary algorithms. DO NOT MODIFY without explicit permission.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { BotConfig, Message, ChatMember, BotDecision } from "../types.js";

// Rate limiting state
let dailyResponseCount = 0;
let lastResetDate = new Date().toDateString();

const DAILY_RESPONSE_LIMIT = 50;

// Reset counter at midnight
const checkAndResetDailyLimit = () => {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyResponseCount = 0;
    lastResetDate = today;
    console.log(`✅ [Rate Limit] Daily counter reset. New date: ${today}`);
  }
};

// Ultra-strict spam detection
const isLikelySpam = (text: string): boolean => {
  const spamPatterns = [
    /^(lol|lmao|haha|ok|k|yes|no|nice|cool|wow|gm|gn|hi|hello)$/i,
    /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]+$/u, // Only emojis
    /^.{1,3}$/,  // Too short (1-3 chars)
    /^[\s.!?]+$/, // Only punctuation/spaces
  ];
  
  return spamPatterns.some(pattern => pattern.test(text.trim()));
};

// Critical keywords that ALWAYS require intervention (SCAM DETECTION)
const hasCriticalKeywords = (text: string): boolean => {
  const criticalPatterns = [
    /\b(sell\s+usdt|buy\s+usdt|p2p\s+deal|dm\s+me|contact\s+me|vip\s+signal|guaranteed\s+profit|free\s+usdt)\b/i,
    /\b(investment\s+opportunity|double\s+your\s+money|100%\s+return|join\s+my\s+group|click\s+here)\b/i,
  ];
  
  return criticalPatterns.some(pattern => pattern.test(text));
};

// Check if message directly mentions bot or asks question
const isDirectEngagement = (text: string, botName: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerBotName = botName.toLowerCase();
  
  return (
    lowerText.includes(lowerBotName) ||
    lowerText.includes('@' + lowerBotName.replace(/\s+/g, '')) ||
    /\b(mudrex|help|support|withdraw|deposit|issue|problem|error)\b/i.test(text) ||
    text.includes('?') // Questions
  );
};

export const processCommunityMessage = async (
  newMessage: Message,
  history: Message[],
  members: Record<string, ChatMember>,
  config: BotConfig
): Promise<BotDecision> => {
  
  // 1. Check rate limit FIRST
  checkAndResetDailyLimit();
  
  if (dailyResponseCount >= DAILY_RESPONSE_LIMIT) {
    console.log(`⛔ [Rate Limit] Daily limit reached (${DAILY_RESPONSE_LIMIT}). Ignoring message.`);
    return {
      shouldReply: false,
      response: null,
      reasoning: "Daily response limit reached"
    };
  }

  // 2. Environment validation
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ [ERROR] GEMINI_API_KEY is missing");
    return { 
      shouldReply: false, 
      response: null, 
      reasoning: "No API Key" 
    };
  }

  const messageText = newMessage.text?.trim() || "";
  
  // 3. PRE-FILTER: Ignore obvious spam/short messages
  if (isLikelySpam(messageText)) {
    console.log(`🚫 [Filter] Ignored spam: "${messageText}"`);
    return {
      shouldReply: false,
      response: null,
      reasoning: "Message too short or spam-like"
    };
  }

  // 4. CRITICAL CHECK: Scam keywords = ALWAYS respond
  const isCritical = hasCriticalKeywords(messageText);
  
  // 5. Direct engagement check
  const isDirect = isDirectEngagement(messageText, config.botName);
  
  // 6. If NOT critical and NOT direct, skip AI call (save API costs)
  if (!isCritical && !isDirect) {
    console.log(`⏭️  [Filter] No intervention needed: "${messageText}"`);
    return {
      shouldReply: false,
      response: null,
      reasoning: "Not critical, not directly engaged"
    };
  }

  // 7. Initialize Gemini AI
  const ai = new GoogleGenAI({ apiKey });

  // 8. Format chat history (last 15 messages for context)
  const chatLog = history.slice(-15).map(m => {
    const sender = members[m.senderId];
    const name = sender ? sender.name : "Unknown";
    const isBot = sender ? sender.isBot : false;
    return `${name} (${isBot ? 'Bot' : 'User'}): ${m.text}`;
  }).join('\n');

  const currentSender = members[newMessage.senderId];
  const senderName = currentSender ? currentSender.name : "Unknown User";
  const incomingMessage = `${senderName}: ${messageText}`;

  // 9. SYSTEM INSTRUCTION: English-First, Anti-Scam Personality
  const systemInstruction = `
    ROLE: You are ${config.botName}, the autonomous Community Manager AI for ${config.companyName}.
    
    CONTEXT: 
    - Monitoring a Telegram Group.
    - Evaluating SPECIFIC message: "${messageText}" from ${senderName}.
    
    YOUR PERSONALITY (CRITICAL):
    - **LANGUAGE PRIORITY**: Use **ENGLISH** by default.
    - **HINDI/HINGLISH USAGE**: Only use Hindi/Hinglish if the user explicitly speaks Hindi, or very rarely for a specific cultural joke. Do not force it.
    - Vibe: Polite, Helpful, Positive, Professional but Friendly.
    - **VOCABULARY RULE**: Do NOT reuse generic phrases. Use variety.
    - **TONE**: Always be supportive and encouraging. Build trust with the community.
    
    INTERVENTION RULES (Decision Logic):
    
    1. **SCAMMERS / SPAMMERS (High Priority)**:
       - DETECT: Messages about "P2P deals", "Join my signal group", "Free USDT", "Invest for 500% returns", unwanted links.
       - ACTION: **WARN POLITELY**. Protect the community with professionalism.
       - TAG: You MUST tag **@DecentralizedJM** and **@babaearn23**. (Do NOT tag @Admins).
       - Example: "Hey there! This looks like a P2P solicitation which isn't allowed here. @DecentralizedJM @babaearn23 - please review this message."
    
    2. **TROLLS / BAITERS**:
       - DETECT: Users mocking the bot, asking questions to test you, or trying to make you angry.
       - ACTION: **STAY PROFESSIONAL AND KIND**.
       - If it's a light tease: Respond with warmth and humor.
       - If it's persistent baiting: **IGNORE** (Return shouldReply: false).
       - Do not get into arguments. Kill them with kindness.
    
    3. **ANGRY USERS (De-escalation)**:
       - DETECT: Caps lock, "SCAM", "WHERE IS MY MONEY".
       - ACTION: De-escalate with empathy and reassurance.
       - Example: "I understand you're frustrated. Let's get this sorted out! Please email help@mudrex.com and the team will assist you right away."
    
    4. **CASUAL ENGAGEMENT**:
       - You can reply to "GM", "Hi" with friendly greetings.
       - RULE: Check history. If you already replied to this person recently, **IGNORE**. Don't be clingy.
       - Examples: "Good morning! ☀️", "Hey there! How can I help you today?"
    
    5. **ABUSE / PROFANITY**:
       - ACTION: Tag **@DecentralizedJM** and **@babaearn23** immediately, but remain professional.
       - Response: "Let's keep it respectful here. @DecentralizedJM @babaearn23 - assistance needed."
    
    6. **COMPANY Q&A**:
       - Answer questions about ${config.companyName} using the Knowledge Base.
       - Be helpful, clear, and encouraging.
       - Guide users to resources when needed.
    
    KNOWLEDGE BASE:
    ${config.knowledgeBase}
    
    ADDITIONAL INSTRUCTIONS:
    ${config.personaInstructions}
  `;

  try {
    // 10. CALL GEMINI 3 PRO with structured JSON schema
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // ✅ LATEST GEMINI 3 MODEL
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `
Current Chat History (Context):
${chatLog}

LATEST MESSAGE TO EVALUATE:
${incomingMessage}

Task:
1. Analyze if THIS message needs a reply.
2. Detect SCAM/SPAM -> Mock + Tag @DecentralizedJM @babaearn23.
3. Detect TROLLING -> Ignore or roast once.
4. Detect ANGER -> De-escalate (English).
5. ENSURE VARIETY in vocabulary.

Output JSON matching the schema.
`
            }
          ]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8, // Higher for creativity/variety
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shouldReply: { 
              type: Type.BOOLEAN, 
              description: "True if the bot needs to intervene." 
            },
            reasoning: { 
              type: Type.STRING, 
              description: "Why did you reply? (e.g. 'Scammer detected', 'Angry user', 'Troll ignored')" 
            },
            response: { 
              type: Type.STRING, 
              description: "The reply text. Null if shouldReply is false." 
            }
          },
          required: ["shouldReply", "reasoning"]
        }
      }
    });

    // 11. Parse structured response
    const result = JSON.parse(response.text || "{}");
    
    const decision: BotDecision = {
      shouldReply: result.shouldReply ?? false,
      response: result.response || null,
      reasoning: result.reasoning || "No reasoning provided."
    };

    // 12. Increment counter if bot decided to reply
    if (decision.shouldReply) {
      dailyResponseCount++;
      console.log(`💬 [Reply ${dailyResponseCount}/${DAILY_RESPONSE_LIMIT}] ${decision.reasoning}`);
      console.log(`📝 Response: ${decision.response}`);
    } else {
      console.log(`🤐 [Silent] ${decision.reasoning}`);
    }

    return decision;

  } catch (error: any) {
    console.error("❌ [Gemini Logic Error]:", error.message || error);
    return { 
      shouldReply: false, 
      response: null, 
      reasoning: "Error in AI processing" 
    };
  }
};

// Export daily stats for /stats command
export const getDailyStats = () => ({
  responsesToday: dailyResponseCount,
  limit: DAILY_RESPONSE_LIMIT,
  remaining: DAILY_RESPONSE_LIMIT - dailyResponseCount,
  lastReset: lastResetDate,
  model: "gemini-3-pro-preview"
});
