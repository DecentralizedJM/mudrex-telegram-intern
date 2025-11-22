import React, { useState } from 'react';
import ConfigPanel from './components/ConfigPanel';
import ChatInterface from './components/ChatInterface';
import { BotConfig, DEFAULT_KNOWLEDGE_BASE, DEFAULT_PERSONA } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<BotConfig>({
    botName: 'Mudrex Intern',
    companyName: 'Mudrex',
    sarcasmLevel: 'medium',
    knowledgeBase: DEFAULT_KNOWLEDGE_BASE,
    personaInstructions: DEFAULT_PERSONA,
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0F172A]">
      {/* Left Panel (Config) - hidden on mobile unless toggled, visible on desktop */}
      <ConfigPanel 
        config={config} 
        setConfig={setConfig} 
        isOpen={isConfigOpen}
        toggleOpen={() => setIsConfigOpen(!isConfigOpen)}
      />

      {/* Right Panel (Chat Simulator) */}
      <ChatInterface 
        config={config} 
        toggleConfig={() => setIsConfigOpen(!isConfigOpen)}
      />
    </div>
  );
};

export default App;
