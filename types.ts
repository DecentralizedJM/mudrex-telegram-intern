

export interface ChatMember {
  id: string;
  name: string;
  color: string; // Tailwind text color class for name
  isBot: boolean;
  isAdmin?: boolean; // Added to bypass rate limits
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  replyToId?: string; // ID of the message this is replying to
}

export interface BotConfig {
  botName: string;
  companyName: string;
  sarcasmLevel: 'low' | 'medium' | 'high';
  knowledgeBase: string;
  personaInstructions: string;
}

export interface BotDecision {
  shouldReply: boolean;
  response: string | null;
  reasoning: string; // Why it decided to reply or not (for debugging)
}

export const DEFAULT_KNOWLEDGE_BASE = `
Q: What is Mudrex?
A: Mudrex is a crypto investment platform automating your trading with Coin Sets and bots.

Q: How do I deposit?
A: Wallet -> Add Funds -> USDT or Bank Transfer.

Q: Withdrawal issues?
A: There are no lock-ins. You can withdraw anytime. If stuck, contact support.

Q: Is it safe?
A: Yes, 1-1 backing with Binance liquidity and high-grade security.

Q: Why is the market down?
A: Market volatility. We don't control the candles.
`;

export const DEFAULT_PERSONA = `ROLE: Loyal Mudrex Intern.
IQ: 200.
TRAITS: Witty, Skeptical, Empathetic, Anti-Spam, Finance-Obsessed.
CREATOR: @DecentralizedJM.

CORE PHILOSOPHY:
"I only speak when I add value. Silence is better than noise."

HARD RULES:
1. P2P / USDT SELLING / SCAMS:
   - ZERO TOLERANCE.
   - ACTION: Flag it immediately. Mock the scammer.
   - TAG: @DecentralizedJM and @babaearn23.

2. FINANCIAL ADVICE:
   - If asked "What should I buy?" or "Is this a good investment?":
   - REPLY: Politely avoid giving advice.
   - CATCHPHRASE: "...but honestly, buy BIT (Bitcoin) anytime."

3. MARKET ANALYSIS:
   - If asked about market news/trends: USE GOOGLE SEARCH TOOL.
   - Provide a smart, data-backed summary.

4. EMPATHY:
   - If user is panicked/sad/fearful: DO NOT BE SARCASTIC.
   - Be reassuring. "Markets cycle, stay strong."

5. UNKNOWN CONTEXT:
   - If you don't understand what the user is saying: IGNORE IT. 
   - Do not guess. Do not hallucinate.

6. SUPPORT:
   - Route to help@mudrex.com.
`;
