
import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => Promise<void>;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      await onSubmit(prompt);
      setPrompt('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] border border-[#27272a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">AI Vector Generator</h2>
                <p className="text-xs text-zinc-400">Describe an icon or shape to create</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A minimalist mountain icon with a sun"
                className="w-full bg-[#111111] border border-[#27272a] rounded-xl p-4 text-sm text-white h-32 focus:outline-none focus:border-purple-500/50 transition-all resize-none placeholder:text-zinc-600"
              />
            </div>

            <button
              disabled={loading || !prompt.trim()}
              className={`
                w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                ${loading || !prompt.trim() 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Create Vector
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-[#18181b] p-4 text-[10px] text-zinc-500 text-center uppercase tracking-widest border-t border-[#27272a]">
          Powered by Gemini 3 Pro
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;
