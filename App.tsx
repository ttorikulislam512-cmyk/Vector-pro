
import React, { useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { 
  Download,
  Trash2,
  Plus,
  Minus,
  Layers,
  Settings,
  Maximize2,
  Minimize2,
  Group as GroupIcon,
  Ungroup as UngroupIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { ToolType } from './types';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import LayerPanel from './components/LayerPanel';
import AIPromptModal from './components/AIPromptModal';
import { generateVectorPath } from './services/geminiService';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathPoints = useRef<fabric.Point[]>([]);
  const currentPath = useRef<fabric.Polyline | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 'transparent',
      fireRightClick: true,
      stopContextMenu: true,
      preserveObjectStacking: true,
    });

    fabricCanvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));

    // Handle Path Drawing (Pen Tool)
    fabricCanvas.on('mouse:down', (options) => {
      if (activeTool !== 'pen') return;
      const pointer = fabricCanvas.getPointer(options.e);
      const point = new fabric.Point(pointer.x, pointer.y);
      pathPoints.current.push(point);

      if (pathPoints.current.length === 1) {
        const poly = new fabric.Polyline(pathPoints.current, {
          stroke: '#3b82f6',
          strokeWidth: 2,
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
        currentPath.current = poly;
        fabricCanvas.add(poly);
      } else {
        currentPath.current?.set({ points: [...pathPoints.current] });
      }
      fabricCanvas.renderAll();
    });

    // Double click to finish path
    fabricCanvas.on('mouse:dblclick', () => {
      if (activeTool === 'pen' && currentPath.current) {
        const finalPath = new fabric.Path(
          `M ${pathPoints.current.map(p => `${p.x} ${p.y}`).join(' L ')} Z`, 
          {
            fill: '#3b82f6',
            stroke: '#2563eb',
            strokeWidth: 1,
          }
        );
        fabricCanvas.remove(currentPath.current);
        fabricCanvas.add(finalPath);
        fabricCanvas.setActiveObject(finalPath);
        
        pathPoints.current = [];
        currentPath.current = null;
        setActiveTool('select');
      }
    });

    setCanvas(fabricCanvas);

    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      fabricCanvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, [activeTool]);

  const handleToolClick = (tool: ToolType) => {
    if (tool === 'ai') {
      setIsAIModalOpen(true);
      return;
    }
    setActiveTool(tool);
    if (tool === 'rect') addRect();
    if (tool === 'circle') addCircle();
    if (tool === 'poly') addTriangle();
    if (tool === 'text') addText();
  };

  const addRect = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 150, top: 150, fill: '#3b82f6', width: 100, height: 100,
      rx: 8, ry: 8, strokeWidth: 0,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    setActiveTool('select');
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 150, top: 150, fill: '#10b981', radius: 50,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    setActiveTool('select');
  };

  const addTriangle = () => {
    if (!canvas) return;
    const tri = new fabric.Triangle({
      left: 150, top: 150, fill: '#f59e0b', width: 100, height: 100,
    });
    canvas.add(tri);
    canvas.setActiveObject(tri);
    setActiveTool('select');
  };

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: 150, top: 150, fill: '#ffffff', fontSize: 24, fontFamily: 'Inter'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setActiveTool('select');
  };

  const handleAIAdd = async (prompt: string) => {
    if (!canvas) return;
    try {
      const pathData = await generateVectorPath(prompt);
      const path = new fabric.Path(pathData, {
        left: canvas.getWidth() / 2 - 50,
        top: canvas.getHeight() / 2 - 50,
        fill: '#8b5cf6',
        stroke: '#7c3aed',
        strokeWidth: 2,
        scaleX: 1.5,
        scaleY: 1.5,
      });
      canvas.add(path);
      canvas.setActiveObject(path);
      setIsAIModalOpen(false);
      setActiveTool('select');
    } catch (e) {
      alert("AI failed to generate vector. Check your API key.");
    }
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    canvas.discardActiveObject();
    canvas.remove(...activeObjects);
    canvas.requestRenderAll();
  };

  const groupSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) return;
    const group = new fabric.Group(activeObjects);
    canvas.remove(...activeObjects);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const ungroupSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;
    const group = activeObject as fabric.Group;
    const items = group.getObjects();
    group.destroy();
    canvas.remove(group);
    canvas.add(...items);
    canvas.setActiveObject(new fabric.ActiveSelection(items, { canvas }));
    canvas.renderAll();
  };

  const exportCanvas = (format: 'png' | 'jpeg' | 'svg') => {
    if (!canvas) return;
    let dataUrl = '';
    if (format === 'svg') {
      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      dataUrl = URL.createObjectURL(blob);
    } else {
      dataUrl = canvas.toDataURL({ format, multiplier: 3 });
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `vector-design.${format}`;
    link.click();
  };

  return (
    <div className="flex h-screen w-screen bg-[#09090b] overflow-hidden select-none">
      <Toolbar activeTool={activeTool} onToolSelect={handleToolClick} />

      <main className="flex-1 relative overflow-hidden canvas-container" ref={containerRef}>
        <canvas ref={canvasRef} />
        
        {/* Help Overlay for Pen Tool */}
        {activeTool === 'pen' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm shadow-xl z-50">
            Click to add points • Double-click to close path
          </div>
        )}

        {/* Zoom & Navigation Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#18181b]/80 border border-[#27272a] rounded-2xl px-5 py-3 flex items-center gap-6 shadow-2xl backdrop-blur-md">
          <button onClick={() => { if(canvas) { const newZoom = Math.max(0.1, zoom - 0.1); setZoom(newZoom); canvas.setZoom(newZoom); } }} className="hover:text-blue-500 transition-colors">
            <Minus size={18} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col items-center">
             <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Zoom</span>
             <span className="text-xs font-mono font-medium">{Math.round(zoom * 100)}%</span>
          </div>
          <button onClick={() => { if(canvas) { const newZoom = Math.min(5, zoom + 0.1); setZoom(newZoom); canvas.setZoom(newZoom); } }} className="hover:text-blue-500 transition-colors">
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Floating Action Menu */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <div className="flex bg-[#18181b]/90 border border-[#27272a] rounded-xl p-1 shadow-xl backdrop-blur-sm">
            <button 
              onClick={groupSelected} 
              title="Group Selection"
              className="p-2 hover:bg-[#27272a] rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <GroupIcon size={18} />
            </button>
            <button 
              onClick={ungroupSelected} 
              title="Ungroup Selection"
              className="p-2 hover:bg-[#27272a] rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <UngroupIcon size={18} />
            </button>
            <div className="w-[1px] bg-zinc-800 mx-1 my-2" />
            <button onClick={() => exportCanvas('svg')} className="px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-tight">
              <Download size={14} /> SVG
            </button>
            <button onClick={() => exportCanvas('png')} className="px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors uppercase tracking-tight">
              PNG
            </button>
          </div>
          <button onClick={deleteSelected} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-2.5 rounded-xl transition-all shadow-lg hover:shadow-red-900/10">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Toggle Right Panel */}
        <button 
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className={`absolute top-1/2 -translate-y-1/2 right-0 bg-[#111111] border border-[#27272a] p-1.5 rounded-l-xl transition-all z-40 ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-0'}`}
        >
          {isRightPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </main>

      {/* Right Side Panels */}
      <div className={`
        bg-[#111111] border-l border-[#27272a] flex flex-col transition-all duration-300 shadow-2xl
        ${isRightPanelOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'}
      `}>
        <PropertiesPanel selectedObject={selectedObject} canvas={canvas} />
        <LayerPanel canvas={canvas} onSelect={(obj) => { canvas?.setActiveObject(obj); canvas?.renderAll(); }} />
      </div>

      {isAIModalOpen && (
        <AIPromptModal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
          onSubmit={handleAIAdd} 
        />
      )}
    </div>
  );
};

export default App;
