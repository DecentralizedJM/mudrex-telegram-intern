import React from 'react';
import { BotConfig } from '../types';
import { Save, Database, User, MessageSquare } from 'lucide-react';

interface ConfigPanelProps {
  config: BotConfig;
  setConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
  isOpen: boolean;
  toggleOpen: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, isOpen, toggleOpen }) => {
  const handleChange = (field: keyof BotConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // CSS transform for the sliding drawer effect
  const drawerClass = isOpen 
    ? "translate-x-0" 
    : "-translate-x-full lg:translate-x-0 lg:static lg:w-1/3";

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-full sm:w-96 bg-slate-900 border-r border-slate-700 transform transition-transform duration-300 ease-in-out overflow-y-auto ${drawerClass}`}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Mod Bot Studio
          </h2>
          <button onClick={toggleOpen} className="lg:hidden text-slate-400 hover:text-white">
            Close
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Design the logic for your autonomous Community Manager. Test how it reacts to community traffic.
        </p>

        {/* Identity */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-blue-300 flex items-center gap-2">
            <User className="w-4 h-4" /> Bot Identity
          </label>
          <div className="grid grid-cols-2 gap-2">
             <input
              type="text"
              value={config.botName}
              onChange={(e) => handleChange('botName', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Bot Name"
            />
             <input
              type="text"
              value={config.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Company"
            />
          </div>
        </div>

        {/* Personality */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-blue-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Tone & Sarcasm
          </label>
          <select
            value={config.sarcasmLevel}
            onChange={(e) => handleChange('sarcasmLevel', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="low">Low (Professional)</option>
            <option value="medium">Medium (Witty Intern)</option>
            <option value="high">High (Savage Mode)</option>
          </select>
          
          <textarea
            value={config.personaInstructions}
            onChange={(e) => handleChange('personaInstructions', e.target.value)}
            className="w-full h-24 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            placeholder="Extra logic (e.g., 'Ignore people who say GM')"
          />
        </div>

        {/* Knowledge Base */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-blue-300 flex items-center gap-2">
            <Database className="w-4 h-4" /> Knowledge Base (RAG)
          </label>
          <p className="text-xs text-slate-500">
            The bot will use this fact sheet to answer questions. If a question isn't covered here or in general crypto knowledge, it may refuse to answer.
          </p>
          <textarea
            value={config.knowledgeBase}
            onChange={(e) => handleChange('knowledgeBase', e.target.value)}
            className="w-full h-64 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
            placeholder="Q: ... A: ..."
          />
        </div>

        <div className="pt-4 border-t border-slate-800">
           <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors">
             <Save className="w-4 h-4" />
             Updates Auto-Saved
           </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;