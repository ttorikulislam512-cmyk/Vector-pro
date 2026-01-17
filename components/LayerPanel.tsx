
import React, { useState, useEffect } from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
// Import fabric as namespace to resolve compatibility in v7
import * as fabric from 'fabric';

interface LayerPanelProps {
  canvas: fabric.Canvas | null;
  onSelect: (obj: fabric.Object) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ canvas, onSelect }) => {
  const [layers, setLayers] = useState<fabric.Object[]>([]);

  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      // Reverse so newest is on top
      setLayers([...canvas.getObjects()].reverse());
    };

    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);

    updateLayers();

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas]);

  const toggleVisibility = (obj: fabric.Object) => {
    obj.visible = !obj.visible;
    canvas?.renderAll();
    setLayers([...layers]); // trigger re-render
  };

  const moveUp = (obj: fabric.Object) => {
    obj.bringForward();
    canvas?.renderAll();
  };

  const moveDown = (obj: fabric.Object) => {
    obj.sendBackwards();
    canvas?.renderAll();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 pb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
          <Layers size={14} /> Layers
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 no-scrollbar">
        {layers.length === 0 ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-[10px] text-zinc-600 italic">No layers yet</p>
          </div>
        ) : (
          layers.map((layer, idx) => (
            <div 
              key={idx}
              className={`
                group flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer
                ${canvas?.getActiveObject() === layer ? 'bg-blue-600/20' : 'hover:bg-zinc-800/50'}
              `}
              onClick={() => onSelect(layer)}
            >
              <div 
                className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 overflow-hidden shrink-0"
              >
                {layer.type === 'image' ? 'IMG' : (layer.type?.substring(0, 3).toUpperCase() || 'OBJ')}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-zinc-300 truncate font-medium">
                  {layer.type === 'i-text' ? (layer as any).text : `${layer.type} Layer`}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); moveUp(layer); }}
                  className="p-1 hover:text-white transition-colors text-zinc-500"
                >
                  <ChevronUp size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleVisibility(layer); }}
                  className="p-1 hover:text-white transition-colors text-zinc-500"
                >
                  {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LayerPanel;
