
import React from 'react';
import { 
  MousePointer2, 
  PenTool, 
  Square, 
  Circle, 
  Triangle, 
  Type as TextIcon, 
  Eraser, 
  Sparkles,
  HelpCircle,
  Command
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Selection Tool', shortcut: 'V' },
    { id: 'pen', icon: PenTool, label: 'Vector Pen', shortcut: 'P' },
    { id: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: Circle, label: 'Ellipse', shortcut: 'O' },
    { id: 'poly', icon: Triangle, label: 'Triangle', shortcut: 'T' },
    { id: 'text', icon: TextIcon, label: 'Type Tool', shortcut: 'T' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
    { id: 'ai', icon: Sparkles, label: 'Magic AI', special: true },
  ];

  return (
    <aside className="w-16 bg-[#111111] border-r border-[#27272a] flex flex-col items-center py-6 gap-3 z-50">
      <div className="mb-6 relative group">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center font-black text-xl shadow-xl shadow-blue-900/40 ring-2 ring-white/10 group-hover:scale-105 transition-transform cursor-pointer">
          V
        </div>
        <div className="absolute left-full ml-3 hidden group-hover:block bg-[#111111] border border-[#27272a] px-3 py-1.5 rounded-lg text-xs font-bold text-white whitespace-nowrap shadow-2xl z-[100]">
          VectorGenius Pro v1.0
        </div>
      </div>
      
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <div key={tool.id} className="relative group">
            <button
              onClick={() => onToolSelect(tool.id as ToolType)}
              className={`
                relative p-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600/20 text-blue-400 shadow-inner' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}
                ${tool.special ? 'mt-8 text-purple-400 bg-purple-400/5 hover:bg-purple-400/10' : ''}
              `}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50" />
              )}
            </button>
            
            {/* Professional Tooltip */}
            <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 z-[100]">
               <div className="bg-[#1e1e1e] border border-[#27272a] px-3 py-2 rounded-xl flex items-center gap-3 shadow-2xl">
                 <span className="text-xs font-bold text-white whitespace-nowrap">{tool.label}</span>
                 {tool.shortcut && (
                   <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] font-black text-zinc-500">
                     <Command size={8} /> {tool.shortcut}
                   </div>
                 )}
               </div>
            </div>
          </div>
        );
      })}

      <button className="mt-auto p-3 text-zinc-600 hover:text-blue-400 transition-colors">
        <HelpCircle size={20} />
      </button>
    </aside>
  );
};

export default Toolbar;
