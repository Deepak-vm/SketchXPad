import React, { useRef, useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";

export type Tool =
  | "pen"
  | "rectangle"
  | "circle"
  | "line"
  | "eraser"
  | "select"
  | "arrow"
  | "text";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
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

interface DrawingCanvasProps {
  selectedTool: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
}

export default function DrawingCanvas({
  selectedTool,
  strokeColor,
  strokeWidth,
  backgroundColor,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(
    null
  );
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const drawElement = useCallback(
    (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
      ctx.globalAlpha = element.opacity;
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (element.type) {
        case "pen":
          if (element.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            ctx.stroke();
          }
          break;

        case "rectangle":
          if (element.points.length >= 2) {
            const start = element.points[0];
            const end = element.points[element.points.length - 1];
            const width = end.x - start.x;
            const height = end.y - start.y;
            ctx.beginPath();
            ctx.rect(start.x, start.y, width, height);
            ctx.stroke();
          }
          break;

        case "circle":
          if (element.points.length >= 2) {
            const start = element.points[0];
            const end = element.points[element.points.length - 1];
            const radius = Math.sqrt(
              Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
            );
            ctx.beginPath();
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;

        case "line":
          if (element.points.length >= 2) {
            const start = element.points[0];
            const end = element.points[element.points.length - 1];
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
          break;

        case "eraser":
          if (element.points.length > 1) {
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = element.strokeWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            ctx.stroke();
            ctx.restore();
          }
          break;

        case "arrow":
          if (element.points.length >= 2) {
            const start = element.points[0];
            const end = element.points[element.points.length - 1];

            // Draw the line
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            // Draw arrowhead
            const headLength = Math.max(10, element.strokeWidth * 2);
            const angle = Math.atan2(end.y - start.y, end.x - start.x);

            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle - Math.PI / 6),
              end.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle + Math.PI / 6),
              end.y - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }
          break;

        case "text":
          if (element.text && element.points.length > 0) {
            ctx.save();
            ctx.fillStyle = element.color;
            ctx.globalAlpha = element.opacity;
            // Better font sizing based on stroke width
            const fontSize = Math.max(16, element.strokeWidth * 8);
            ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.textBaseline = "top";
            ctx.fillText(
              element.text,
              element.points[0].x,
              element.points[0].y
            );
            ctx.restore();
          }
          break;
      }

      ctx.globalAlpha = 1;
    },
    []
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => drawElement(ctx, element));

    // Draw current element being drawn
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
  }, [elements, currentElement, backgroundColor, drawElement]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undoLastAction();
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          redoLastAction();
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [historyIndex, history.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        redrawCanvas();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "select") return;

    const point = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(point);

    // Handle text tool
    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text && text.trim()) {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: "text",
          points: [point],
          color: strokeColor,
          strokeWidth,
          opacity: 1,
          text: text.trim(),
        };
        setElements((prev) => [...prev, newElement]);
      }
      setIsDrawing(false);
      return;
    }

    // Get the eraser color based on background (though eraser uses destination-out)
    const drawingColor = strokeColor; // Use stroke color for all tools, eraser will use composite operation

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: selectedTool as Tool,
      points: [point],
      color: drawingColor,
      strokeWidth,
      opacity: 1,
    };

    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;

    const point = getMousePos(e);

    if (selectedTool === "pen" || selectedTool === "eraser") {
      setCurrentElement((prev) =>
        prev
          ? {
              ...prev,
              points: [...prev.points, point],
            }
          : null
      );
    } else {
      // For shapes, only update the end point
      setCurrentElement((prev) =>
        prev
          ? {
              ...prev,
              points: [startPoint, point],
            }
          : null
      );
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;

    setIsDrawing(false);
    const newElements = [...elements, currentElement];
    setElements(newElements);
    setCurrentElement(null);

    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const clearCanvas = () => {
    setElements([]);
    setCurrentElement(null);
    // Add clear state to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undoLastAction = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  const redoLastAction = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
        style={{
          cursor: selectedTool === "eraser" ? "crosshair" : "crosshair",
        }}
      />

      {/* Canvas actions */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={undoLastAction}
          className="px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={historyIndex <= 0}
          title="Undo (Ctrl+Z)"
        >
          <span className="text-lg">↶</span>
        </button>
        <button
          onClick={redoLastAction}
          className="px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={historyIndex >= history.length - 1}
          title="Redo (Ctrl+Y)"
        >
          <span className="text-lg">↷</span>
        </button>
        <button
          onClick={clearCanvas}
          className="px-3 py-2 bg-white text-red-500 rounded-lg shadow-md hover:bg-red-600 hover:text-white transition-colors"
          title="Clear All"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
