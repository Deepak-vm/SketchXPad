export type Tool =
    | "pen"
    | "rectangle"
    | "ellipse"
    | "line"
    | "eraser"
    | "select"
    | "arrow"
    | "text";

export interface Point {
    x: number;
    y: number;
}

export interface DrawingElement {
    id: string;
    type: Tool;
    points: Point[];
    color: string;
    strokeWidth: number;
    opacity: number;
    startPoint?: Point;
    endPoint?: Point;
    text?: string;
}

export interface DrawingCanvasProps {
    selectedTool: string;
    strokeColor: string;
    strokeWidth: number;
    backgroundColor: string;
    onToolChange?: (tool: Tool) => void;
}

export interface CanvasState {
    isDrawing: boolean;
    elements: DrawingElement[];
    history: DrawingElement[][];
    historyIndex: number;
    currentElement: DrawingElement | null;
    startPoint: Point;
    isTyping: boolean;
    textInput: string;
    textPosition: Point | null;
    showCursor: boolean;
    selectedElement: string | null;
    isDragging: boolean;
    dragOffset: Point;
    hoveredElement: string | null;
}
