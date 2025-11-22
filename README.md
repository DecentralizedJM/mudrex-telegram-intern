# 🤖 Mudrex Community Intern Bot

**Repository:** [mudrex-tg-intern](https://github.com/DecentralizedJM/mudrex-tg-intern)

A sophisticated **Telegram Community Moderator Bot** simulation designed to act as the "Ideal Intern" for the Mudrex community. This project provides a Logic Studio to visualize, configure, and test the bot's autonomous decision-making engine.

## 🌟 Features

### 🧠 Intelligent Decision Engine (Gemini 3 Pro)
The bot doesn't just reply to everything. It evaluates:
*   **Sentiment:** Is the user angry? Happy? Trolling?
*   **Context:** Has it already replied recently? (Rate limiting)
*   **Safety:** Detects scams, P2P spam, and abusive language.
*   **Knowledge:** Uses Google Search to provide real-time market updates.

### 🎭 Adaptive Persona
*   **Smart Sarcasm:** De-escalates angry users with wit ("Calm down bro, caps lock won't speed up the blockchain").
*   **Hinglish Support:** Prioritizes English but switches to Hindi/Hinglish naturally when context demands.
*   **Anti-Scam Protocols:** Automatically detects P2P/Signal group spammers, mocks them, and tags admins (`@DecentralizedJM`, `@babaearn23`).

### 🛠 Traffic Simulator
Test the bot's logic in real-time without connecting to Telegram:
*   **💬 Question Mode:** Simulates standard FAQ queries.
*   **⚡ Chatter Mode:** Simulates random community noise ("GM", "WAGMI").
*   **😡 Angry Mode:** Simulates FUD and caps-lock rage.
*   **☠️ Scam Mode:** Simulates P2P/Signal spam attacks.

## 🚀 Tech Stack
*   **Frontend:** React (TypeScript), Tailwind CSS
*   **AI Logic:** Google Gemini 3 Pro Preview
*   **State Management:** React Hooks

## 📂 Project Structure
*   `services/geminiService.ts`: The "Brain" of the bot. Contains the system prompts and JSON schema for decision making.
*   `components/ChatInterface.tsx`: The UI that simulates a Telegram group chat.
*   `components/ConfigPanel.tsx`: Configuration drawer to tweak the bot's personality and knowledge base.

## 📝 Local Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up API Key:**
    Rename the example file and add your key:
    ```bash
    cp .env.example .env
    ```
    *Edit `.env` and paste your Google Gemini API Key.*

3.  **Run the simulator:**
    ```bash
    npm run dev
    ```

---
*Built for the Mudrex Community*