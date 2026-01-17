
export type ToolType = 'select' | 'pen' | 'rect' | 'circle' | 'poly' | 'text' | 'eraser' | 'ai';

export interface EditorState {
  activeTool: ToolType;
  selectedObject: any | null;
  zoom: number;
  history: any[];
}

export interface ObjectProperties {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rx?: number; // corner radius for rect
  ry?: number;
}
