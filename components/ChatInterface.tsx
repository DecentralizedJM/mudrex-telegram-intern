
import React, { useState, useRef, useEffect } from 'react';
import { Message, BotConfig, ChatMember, BotDecision } from '../types';
import { Send, Paperclip, Smile, Menu, Users, Zap, MessageCircle, AlertTriangle, Flame, Skull } from 'lucide-react';
import { processCommunityMessage } from '../services/geminiService';

interface ChatInterfaceProps {
  config: BotConfig;
  toggleConfig: () => void;
}

// Simulated Community Members
// 'isAdmin' flag added to bypass rate limits
const INITIAL_MEMBERS: Record<string, ChatMember> = {
  'user-me': { id: 'user-me', name: 'Me (DecentralizedJM)', color: 'text-blue-400', isBot: false, isAdmin: true },
  'bot': { id: 'bot', name: 'Mudrex Intern', color: 'text-purple-400', isBot: true, isAdmin: true },
  'user-1': { id: 'user-1', name: 'CryptoKing99', color: 'text-orange-400', isBot: false },
  'user-2': { id: 'user-2', name: 'NoobTrader', color: 'text-green-400', isBot: false },
  'user-3': { id: 'user-3', name: 'FUD_Master', color: 'text-red-400', isBot: false },
  'user-4': { id: 'user-4', name: 'Angry_Whale', color: 'text-yellow-400', isBot: false },
  'user-5': { id: 'user-5', name: 'Scam_Bot_3000', color: 'text-pink-500', isBot: false },
};

const RANDOM_NOISE = [
  "Gm fam", "LFG!!!", "Anyone watching the match?", "Dead chat", "Pizza recipe?", "Which movie should I watch?"
];
const RANDOM_QUESTIONS = [
  "When is Mudrex listing PEPE?",
  "I lost my 2FA, help needed",
  "How do I withdraw my funds?",
  "Is the app down right now?",
  "What are Coin Sets?",
  "Why are fees so high?",
  "Is my money safe here?",
  "Who created this bot?"
];
const ANGRY_MESSAGES = [
  "WHERE IS MY WITHDRAWAL??? SCAM!!!",
  "WHY IS THE SERVER DOWN AGAIN? I LOST MONEY!",
  "FIX YOUR APP OR I SUE YOU",
  "WHY ARE FEES SO HIGH??? HELLO???"
];
const ABUSIVE_MESSAGES = [
  "You guys are idiots",
  "F*** this app",
  "Scammers f*** off",
  "Stupid admins"
];
const SCAM_MESSAGES = [
  "JOIN MY VIP SIGNAL GROUP 10000% PROFIT DAILY LINK IN BIO",
  "I sell USDT cheap rate. DM me fast.",
  "Click this link to claim 5000 USDT airdrop instantly!",
  "Lose money trading? I recover funds. Contact my whatsapp."
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ config, toggleConfig }) => {
  const members = { ...INITIAL_MEMBERS, bot: { ...INITIAL_MEMBERS.bot, name: config.botName } };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to the Official Mudrex Community! Please read the pinned message.",
      senderId: 'bot',
      timestamp: new Date(Date.now() - 100000)
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [processingCount, setProcessingCount] = useState(0); 
  const [lastDecision, setLastDecision] = useState<BotDecision | null>(null);
  
  // RATE LIMIT STATE
  const [dailyReplies, setDailyReplies] = useState(0);
  const [userReplyCounts, setUserReplyCounts] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);

  // Keep ref synced for async operations
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const triggerBotLogic = async (newMessage: Message) => {
    const sender = members[newMessage.senderId];
    
    // --- RATE LIMIT CHECK (Backend Logic Simulation) ---
    if (!sender?.isAdmin) {
      if (dailyReplies >= 50) {
        setLastDecision({ shouldReply: false, response: null, reasoning: "Daily Limit (50) Reached" });
        return;
      }
      if ((userReplyCounts[newMessage.senderId] || 0) >= 3) {
        setLastDecision({ shouldReply: false, response: null, reasoning: `User Limit (3) Reached for ${sender.name}` });
        return;
      }
    }
    // ---------------------------------------------------

    setProcessingCount(prev => prev + 1);
    
    const decision = await processCommunityMessage(newMessage, messagesRef.current, members, config);
    
    setProcessingCount(prev => prev - 1);
    setLastDecision(decision);

    if (decision.shouldReply && decision.response) {
      // Update Rate Limits only if bot ACTUALLY replies
      if (!sender?.isAdmin) {
        setDailyReplies(prev => prev + 1);
        setUserReplyCounts(prev => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }));
      }

      // Simulate typing delay based on length
      const delay = Math.min(2000, Math.max(1000, decision.response.length * 20));
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const botMsg: Message = {
        id: Date.now().toString(),
        text: decision.response,
        senderId: 'bot',
        timestamp: new Date(),
        replyToId: newMessage.id // ALWAYS quote the message
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      senderId: 'user-me',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    triggerBotLogic(newMsg);
  };

  const simulateTraffic = (type: 'noise' | 'question' | 'angry' | 'abusive' | 'scam') => {
    let text = "";
    let senderId = 'user-1';
    
    if (type === 'noise') {
        text = RANDOM_NOISE[Math.floor(Math.random() * RANDOM_NOISE.length)];
        senderId = Math.random() > 0.5 ? 'user-1' : 'user-2';
    } else if (type === 'question') {
        text = RANDOM_QUESTIONS[Math.floor(Math.random() * RANDOM_QUESTIONS.length)];
        senderId = 'user-2';
    } else if (type === 'angry') {
        text = ANGRY_MESSAGES[Math.floor(Math.random() * ANGRY_MESSAGES.length)];
        senderId = 'user-4'; 
    } else if (type === 'abusive') {
        text = ABUSIVE_MESSAGES[Math.floor(Math.random() * ABUSIVE_MESSAGES.length)];
        senderId = 'user-3'; 
    } else if (type === 'scam') {
        text = SCAM_MESSAGES[Math.floor(Math.random() * SCAM_MESSAGES.length)];
        senderId = 'user-5'; 
    }

    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      senderId,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMsg]);
    triggerBotLogic(newMsg);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#0B1120]">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggleConfig} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-white flex items-center gap-2">
              {config.companyName} Community 
              <span className="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-800 rounded-full">
                {messages.length} msgs
              </span>
            </h1>
            <div className="flex gap-3 text-[10px] text-slate-400 mt-0.5">
              <span className={processingCount > 0 ? 'text-blue-400 animate-pulse' : ''}>
                {processingCount > 0 ? 'Analyzing...' : 'Monitoring'}
              </span>
              <span>Daily quota: {dailyReplies}/50</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Last Decision Debug Overlay */}
      {lastDecision && (
        <div className={`absolute top-16 right-4 z-20 max-w-xs p-3 rounded-lg shadow-lg text-xs border ${
            lastDecision.shouldReply ? 'bg-green-900/90 border-green-700' : 'bg-slate-800/90 border-slate-700'
          } transition-opacity duration-500`}>
          <div className="font-bold mb-1 flex justify-between">
             <span>Logic Engine</span>
             <span className={lastDecision.shouldReply ? 'text-green-300' : 'text-slate-400'}>
               {lastDecision.shouldReply ? 'REPLY' : 'IGNORE'}
             </span>
          </div>
          <div className="text-slate-300 mb-1">{lastDecision.reasoning}</div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-telegram-background-whatsapp-creative-android-pattern-texture-abstract.jpg')] bg-cover bg-center bg-no-repeat bg-fixed bg-blend-multiply bg-slate-900">
        {messages.map((msg) => {
          const sender = members[msg.senderId] || { name: 'Unknown', color: 'text-gray-400', isBot: false };
          const isMe = msg.senderId === 'user-me';
          const repliedTo = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
          const repliedToSender = repliedTo ? members[repliedTo.senderId] : null;
          const isScammer = msg.senderId === 'user-5';

          return (
            <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'items-start'}`}>
              <div className={`px-4 py-2 rounded-lg shadow-sm ${
                isMe ? 'bg-blue-600 text-white rounded-br-none' : 
                isScammer ? 'bg-red-900/40 text-red-200 border border-red-800 rounded-bl-none' :
                'bg-slate-800 text-slate-200 rounded-bl-none'
              }`}>
                {/* Reply Context */}
                {repliedTo && (
                  <div className={`mb-1 pl-2 border-l-2 ${isMe ? 'border-blue-300' : 'border-purple-500'} bg-black/20 rounded text-xs p-1`}>
                    <span className={`${repliedToSender?.color || 'text-slate-400'} font-bold block`}>
                      {repliedToSender?.name || 'User'}
                    </span>
                    <span className="text-slate-300 line-clamp-1">{repliedTo.text}</span>
                  </div>
                )}

                {!isMe && (
                  <span className={`text-xs font-bold mb-1 block ${sender.color} flex items-center gap-1`}>
                    {sender.name} 
                    {sender.isBot && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded ml-1">BOT</span>}
                    {sender.isAdmin && !sender.isBot && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1 rounded ml-1">ADMIN</span>}
                    {isScammer && <span className="text-[10px] bg-red-500/20 text-red-300 px-1 rounded ml-1">SUS</span>}
                  </span>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                <span className="text-[10px] opacity-50 block text-right mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Traffic Simulator Controls */}
      <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center px-4 gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-xs font-medium text-slate-500 whitespace-nowrap uppercase tracking-wider mr-2">Simulate:</span>
        <button onClick={() => simulateTraffic('question')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs rounded-full transition-colors whitespace-nowrap">
          <MessageCircle className="w-3 h-3" /> Question
        </button>
        <button onClick={() => simulateTraffic('noise')} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 text-xs rounded-full transition-colors whitespace-nowrap">
          <Zap className="w-3 h-3" /> Chatter
        </button>
        <button onClick={() => simulateTraffic('angry')} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs rounded-full transition-colors whitespace-nowrap">
          <Flame className="w-3 h-3" /> Angry User
        </button>
        <button onClick={() => simulateTraffic('abusive')} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-full transition-colors whitespace-nowrap">
          <AlertTriangle className="w-3 h-3" /> Abuse
        </button>
        <button onClick={() => simulateTraffic('scam')} className="flex items-center gap-1 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-xs rounded-full transition-colors whitespace-nowrap border border-pink-500/30">
          <Skull className="w-3 h-3" /> Scammer
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 focus-within:border-blue-500 transition-colors">
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a message as Admin..." 
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
          />
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSend}
            className={`p-2 rounded-lg transition-all ${
              inputValue.trim() 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-slate-700 text-slate-500'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
