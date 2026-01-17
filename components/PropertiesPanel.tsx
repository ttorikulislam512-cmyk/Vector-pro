
import React, { useState, useEffect } from 'react';
import { Settings, Droplet, Maximize, Minus, Plus, Box, Layout } from 'lucide-react';
import * as fabric from 'fabric';

interface PropertiesPanelProps {
  selectedObject: any | null;
  canvas: fabric.Canvas | null;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedObject, canvas }) => {
  const [fill, setFill] = useState('#ffffff');
  const [stroke, setStroke] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [rx, setRx] = useState(0);
  const [isGradient, setIsGradient] = useState(false);

  useEffect(() => {
    if (selectedObject) {
      const currentFill = selectedObject.fill;
      if (typeof currentFill === 'string') {
        setFill(currentFill);
        setIsGradient(false);
      } else if (currentFill && (currentFill as any).type) {
        setIsGradient(true);
      }
      setStroke(selectedObject.stroke as string || '#000000');
      setStrokeWidth(selectedObject.strokeWidth || 0);
      setOpacity(selectedObject.opacity || 1);
      setRx(selectedObject.rx || 0);
    }
  }, [selectedObject]);

  const updateObject = (props: any) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set(props);
    canvas.renderAll();
  };

  const applyGradient = () => {
    if (!selectedObject || !canvas) return;
    const grad = new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: selectedObject.width || 100, y2: selectedObject.height || 100 },
      colorStops: [
        { offset: 0, color: '#3b82f6' },
        { offset: 1, color: '#8b5cf6' }
      ]
    });
    updateObject({ fill: grad });
    setIsGradient(true);
  };

  const applySolid = (color: string) => {
    updateObject({ fill: color });
    setIsGradient(false);
  };

  if (!selectedObject) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[60%] text-zinc-600 space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
           <Settings size={28} className="opacity-20" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-zinc-400">No selection</p>
          <p className="text-[10px] max-w-[140px] leading-relaxed">Pick an object on the canvas to edit its vector properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 border-b border-[#27272a] overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Box size={14} className="text-blue-500" />
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Object Settings</h3>
        </div>
        <span className="text-[9px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-tighter">{selectedObject.type}</span>
      </div>

      {/* Fill Color */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2">
            <Droplet size={12} /> Appearance
          </label>
          <div className="flex bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
             <button 
               onClick={() => applySolid(fill)}
               className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${!isGradient ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               Solid
             </button>
             <button 
               onClick={applyGradient}
               className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${isGradient ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               Gradient
             </button>
          </div>
        </div>
        
        {!isGradient ? (
          <div className="flex items-center gap-3">
            <div className="relative group overflow-hidden w-11 h-11 rounded-xl border-2 border-zinc-800 p-0.5">
              <input 
                type="color" 
                value={fill}
                onChange={(e) => { setFill(e.target.value); applySolid(e.target.value); }}
                className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <input 
                type="text" 
                value={fill.toUpperCase()}
                onChange={(e) => { setFill(e.target.value); applySolid(e.target.value); }}
                className="w-full bg-[#18181b] border border-[#27272a] text-[11px] font-mono px-3 py-2.5 rounded-xl uppercase focus:border-blue-500/50 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-10 rounded-xl border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            Linear Gradient
          </div>
        )}
      </div>

      {/* Stroke */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-zinc-400 uppercase">Outline</label>
        <div className="flex items-center gap-3">
          <div className="relative group overflow-hidden w-9 h-9 rounded-lg border border-zinc-800 p-0.5">
            <input 
              type="color" 
              value={stroke}
              onChange={(e) => { setStroke(e.target.value); updateObject({ stroke: e.target.value }); }}
              className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
            />
          </div>
          <div className="flex-1 flex items-center bg-[#18181b] border border-[#27272a] rounded-xl px-3 group focus-within:border-blue-500/50 transition-colors">
            <input 
              type="number" 
              value={strokeWidth}
              onChange={(e) => { 
                const val = Math.max(0, parseInt(e.target.value) || 0);
                setStrokeWidth(val); 
                updateObject({ strokeWidth: val }); 
              }}
              className="bg-transparent text-[11px] py-2.5 w-full focus:outline-none font-mono"
            />
            <span className="text-[9px] font-black text-zinc-600">PX</span>
          </div>
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Transparency</label>
          <span className="text-[10px] font-mono font-bold text-zinc-500">{Math.round(opacity * 100)}%</span>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={opacity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setOpacity(val);
              updateObject({ opacity: val });
            }}
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Layout Controls */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/50">
        <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2">
          <Layout size={12} /> Dimensions
        </label>
        <div className="grid grid-cols-2 gap-2">
           <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
              <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Width</p>
              <p className="text-xs font-mono text-zinc-300">{Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1))}</p>
           </div>
           <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
              <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Height</p>
              <p className="text-xs font-mono text-zinc-300">{Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1))}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
