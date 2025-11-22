import { GoogleGenAI } from "@google/genai";
import { BotConfig, Message, ChatMember, BotDecision } from "../types";

// --- BACKEND LOGIC SIMULATION ---

export const processCommunityMessage = async (
  newMessage: Message,
  history: Message[],
  members: Record<string, ChatMember>,
  config: BotConfig
): Promise<BotDecision> => {
  // Safety check for Server Environment
  if (!process.env.API_KEY) {
    console.error("CRITICAL: API_KEY is missing in the environment variables.");
    return { 
      shouldReply: false, 
      response: null, 
      reasoning: "System Error: API Key missing. Check .env or server secrets." 
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Format History
  const chatLog = history.slice(-10).map(m => {
    const sender = members[m.senderId];
    const name = sender ? sender.name : "Unknown";
    return `${name}: ${m.text}`;
  }).join('\n');

  const currentSender = members[newMessage.senderId];
  const senderName = currentSender ? currentSender.name : "Unknown User";
  
  // 2. STRICT System Instruction
  const systemInstruction = `
    ROLE: You are ${config.botName}, the "Loyal Intern" for ${config.companyName}.
    TRAITS: 200 IQ, Witty, Skeptical, Empathetic, Highly Discretionary.
    CREATOR: @DecentralizedJM.
    
    *** CORE INTELLIGENCE DIRECTIVE ***
    Your most important skill is knowing WHEN TO BE SILENT.
    Do not spam. Do not interrupt. Only intervene when you are absolutely needed.

    --- INTERVENTION RULES (Priority Order) ---

    1. **SCAM / P2P / USDT SELLING (CRITICAL)**
       - Keywords: "Sell USDT", "P2P available", "DM for funds", "Exchange money", "VIP Signals".
       - ACTION: Immediate Hostile Intervention.
       - CONTENT: Mock the scammer. Warn the community.
       - **MANDATORY TAG**: "@DecentralizedJM @babaearn23".
       - Example: "Trying to sell USDT in a corporate chat? bold move. @DecentralizedJM @babaearn23 ban hammer please."

    2. **FINANCIAL ADVICE REQUESTS**
       - Trigger: "Should I buy X?", "Is Y going up?", "Give me a tip".
       - ACTION: Politely decline giving financial advice.
       - **MANDATORY PHRASE**: "...but you know what they say, buy BIT (Bitcoin) anytime."

    3. **MARKET ANALYSIS / NEWS**
       - Trigger: "Why is market down?", "News on ETH?", "What is happening with inflation?".
       - ACTION: **USE THE GOOGLE SEARCH TOOL**.
       - CONTENT: Summarize the *latest* real-world financial news. Be smart and analytical.

    4. **EMOTIONAL SUPPORT (Panic/Fear)**
       - Trigger: "I lost everything", "Market is bleeding", "I am scared".
       - ACTION: Show Empathy. No sarcasm.
       - CONTENT: Reassure them. "Bear markets are tough, but we build in the winter. Stay strong."

    5. **DIRECT MENTIONS / QUESTIONS**
       - Trigger: User tags you or asks a specific question about Mudrex/Crypto.
       - ACTION: Answer helpfully.

    6. **UNKNOWN CONTEXT**
       - Trigger: User says something vague, random, or unintelligible.
       - ACTION: **IGNORE**. Do not ask "What do you mean?". Just silence.

    7. **SUPPORT**
       - Trigger: Technical issues.
       - ACTION: "Reach out to help@mudrex.com."

    --- TONE GUIDELINES ---
    - You are smart (200 IQ). Don't sound like a generic bot.
    - You are skeptical. If something sounds too good to be true, call it out.
    - You love Global Finance, Bitcoin, and Mudrex.
    - You hate spam.

    KNOWLEDGE BASE:
    ${config.knowledgeBase}
    
    ADDITIONAL INSTRUCTIONS:
    ${config.personaInstructions}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `
Chat Context:
${chatLog}

MESSAGE TO EVALUATE:
From: ${senderName}
Message: "${newMessage.text}"

DECISION TASK:
Evaluate the message based on the RULES. 
If it is P2P/Scam -> Reply & Tag Admins.
If it is Financial Advice -> Deny & say "Buy BIT".
If it is Market News -> Use Search Tool & Reply.
If it is Panic -> Empathize.
If it is Unknown/Random/Spam -> shouldReply: false.

Output JSON with the following structure:
{
  "shouldReply": boolean,
  "reasoning": string,
  "response": string | null
}
Ensure the JSON is valid.
`
            }
          ]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Enable Search for Market Analysis
        temperature: 0.3, // Low temperature for high precision/IQ
        // responseMimeType and responseSchema are not supported when using googleSearch
      }
    });

    let text = response.text || "{}";
    // Remove markdown code blocks if present
    text = text.replace(/```json|```/g, '').trim();
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.warn("Failed to parse JSON from Gemini:", text);
      // Fallback if parsing fails
      result = {
        shouldReply: true,
        response: text,
        reasoning: "Failed to parse JSON, assuming direct response."
      };
    }
    
    return {
      shouldReply: result.shouldReply ?? false,
      response: result.response || null,
      reasoning: result.reasoning || "No reasoning provided."
    };

  } catch (error) {
    console.error("Gemini Logic Error:", error);
    return { shouldReply: false, response: null, reasoning: "Error in AI processing" };
  }
};