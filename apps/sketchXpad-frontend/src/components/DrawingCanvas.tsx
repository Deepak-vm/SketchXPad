import React, { useRef, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";

// Import types and utilities
export type { Tool } from "./canvas/types";
import type {
  DrawingCanvasProps,
  DrawingElement,
  Point,
  Tool,
} from "./canvas/types";
import { drawElement, getMousePos } from "./canvas/drawingUtils";
import {
  findElementAtPoint,
  drawSelectionOutline,
} from "./canvas/selectionUtils";
import {
  createKeyboardHandler,
  type HistoryActions,
} from "./canvas/keyboardHandlers";
import { useCanvasState } from "./canvas/useCanvasState";

interface DrawingCanvasPropsWithSocket extends DrawingCanvasProps {
  onShapeChange?: (
    shape: DrawingElement,
    action: "draw" | "update" | "delete"
  ) => void;
  onClear?: () => void;
  onRemoteChange?: (
    callback: (
      shape: DrawingElement,
      action: "draw" | "update" | "delete"
    ) => void
  ) => void;
  onRemoteClear?: (callback: () => void) => void;
}

export default function DrawingCanvas({
  selectedTool,
  strokeColor,
  strokeWidth,
  backgroundColor,
  onToolChange,
  initialElements = [],
  onShapeChange,
  onClear,
  onRemoteChange,
  onRemoteClear,
}: DrawingCanvasPropsWithSocket) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use custom hook for state management with broadcasting
  const {
    isDrawing,
    elements,
    history,
    historyIndex,
    currentElement,
    startPoint,
    isTyping,
    textInput,
    textPosition,
    showCursor,
    selectedElement,
    isDragging,
    dragOffset,
    hoveredElement,
    setIsDrawing,
    setElements,
    setCurrentElement,
    setStartPoint,
    setIsTyping,
    setTextInput,
    setTextPosition,
    setShowCursor,
    setSelectedElement,
    setIsDragging,
    setDragOffset,
    setHoveredElement,
    addToHistory,
    clearCanvas,
    undoLastAction,
    redoLastAction,
    deleteSelectedElement,
    addElementWithBroadcast,
    updateElementWithBroadcast,
    applyRemoteChange,
    applyRemoteClear,
  } = useCanvasState(initialElements, onShapeChange, onClear);

  // Set up remote change listeners
  useEffect(() => {
    if (onRemoteChange) {
      onRemoteChange(applyRemoteChange);
    }
    if (onRemoteClear) {
      onRemoteClear(applyRemoteClear);
    }
  }, [onRemoteChange, onRemoteClear, applyRemoteChange, applyRemoteClear]);

  const editSelectedElement = useCallback(() => {
    if (!selectedElement) return;

    const element = elements.find((el) => el.id === selectedElement);
    if (!element) return;

    // Only text elements can be edited for now
    if (element.type === "text" && element.text && element.points.length > 0) {
      // Enter edit mode for text
      if (onToolChange) {
        onToolChange("text"); // Switch to text tool temporarily
      }
      setIsTyping(true);
      setTextInput(element.text);
      setTextPosition(element.points[0]);

      // Remove the element temporarily while editing
      const newElements = elements.filter((el) => el.id !== selectedElement);
      setElements(newElements);
      setSelectedElement(null);
    }
  }, [
    selectedElement,
    elements,
    onToolChange,
    setIsTyping,
    setTextInput,
    setTextPosition,
    setElements,
    setSelectedElement,
  ]);

  const addTextElement = useCallback(
    (text: string, position: Point) => {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: "text",
        points: [position],
        color: strokeColor,
        strokeWidth,
        opacity: 1,
        text: text,
      };

      addElementWithBroadcast(newElement);
    },
    [strokeColor, strokeWidth, addElementWithBroadcast]
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Separate eraser elements from other elements
    const nonEraserElements = elements.filter((el) => el.type !== "eraser");
    const eraserElements = elements.filter((el) => el.type === "eraser");

    // Draw all non-eraser elements first
    nonEraserElements.forEach((element) => drawElement(ctx, element));

    // Draw current element being drawn (if it's not an eraser)
    if (currentElement && currentElement.type !== "eraser") {
      drawElement(ctx, currentElement);
    }

    // Draw all eraser elements last (they will create holes)
    eraserElements.forEach((element) => drawElement(ctx, element));

    // Draw current eraser element being drawn
    if (currentElement && currentElement.type === "eraser") {
      drawElement(ctx, currentElement);
    }

    // Draw current text being typed
    if (isTyping && textPosition) {
      ctx.save();
      ctx.fillStyle = strokeColor;
      ctx.globalAlpha = 1;
      const fontSize = Math.max(16, strokeWidth * 8);
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textBaseline = "top";

      if (textInput) {
        ctx.fillText(textInput, textPosition.x, textPosition.y);
      }

      // Draw a blinking cursor only when actively typing
      if (showCursor) {
        const textWidth = textInput ? ctx.measureText(textInput).width : 0;
        const cursorX = textPosition.x + textWidth;
        const cursorHeight = fontSize;
        ctx.fillRect(cursorX, textPosition.y, 2, cursorHeight);
      }

      ctx.restore();
    }

    // Draw selection outline for selected element
    if (selectedElement && selectedTool === "select") {
      const element = elements.find((el) => el.id === selectedElement);
      if (element) {
        drawSelectionOutline(ctx, element);
      }
    }
  }, [
    elements,
    currentElement,
    backgroundColor,
    isTyping,
    textPosition,
    textInput,
    strokeColor,
    strokeWidth,
    showCursor,
    selectedElement,
    selectedTool,
  ]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Blinking cursor effect for text mode
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500); // Blink every 500ms
      return () => clearInterval(interval);
    } else {
      setShowCursor(true);
    }
  }, [isTyping, setShowCursor]);

  // Clear text state when tool changes
  useEffect(() => {
    if (selectedTool !== "text" && isTyping) {
      // Finish any current text when switching tools
      if (textPosition && textInput.trim()) {
        addTextElement(textInput.trim(), textPosition);
      }

      // Clear text state
      setIsTyping(false);
      setTextInput("");
      setTextPosition(null);
    }
  }, [
    selectedTool,
    isTyping,
    textPosition,
    textInput,
    addTextElement,
    setIsTyping,
    setTextInput,
    setTextPosition,
  ]);

  // Keyboard event handling
  useEffect(() => {
    const actions: HistoryActions = {
      undoLastAction,
      redoLastAction,
      clearCanvas,
      deleteSelectedElement,
      editSelectedElement,
    };

    const handleKeyboard = createKeyboardHandler(
      selectedTool,
      selectedElement,
      isTyping,
      textPosition,
      textInput,
      elements,
      actions,
      setIsTyping,
      setTextInput,
      setTextPosition,
      addTextElement
    );

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [
    selectedTool,
    selectedElement,
    isTyping,
    textPosition,
    textInput,
    elements,
    undoLastAction,
    redoLastAction,
    clearCanvas,
    deleteSelectedElement,
    editSelectedElement,
    setIsTyping,
    setTextInput,
    setTextPosition,
    addTextElement,
  ]);

  // Canvas resize handling
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getMousePos(canvas, e);

    // Handle select tool
    if (selectedTool === "select") {
      // Find element at click point
      const clickedElement = findElementAtPoint(point, elements);
      if (clickedElement) {
        setSelectedElement(clickedElement.id);
        setIsDragging(true);
        // Calculate offset from element's first point to click point
        const elementPoint = clickedElement.points[0];
        setDragOffset({
          x: point.x - elementPoint.x,
          y: point.y - elementPoint.y,
        });
      } else {
        setSelectedElement(null);
      }
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);

    // If switching from text tool or clicking elsewhere, finish any current text
    if (isTyping && textPosition) {
      if (textInput.trim()) {
        addTextElement(textInput.trim(), textPosition);
      }

      // Clear text state
      setIsTyping(false);
      setTextInput("");
      setTextPosition(null);
    }

    // Handle text tool
    if (selectedTool === "text") {
      // Start new text input
      setIsTyping(true);
      setTextInput("");
      setTextPosition(point);
      setIsDrawing(false);
      return;
    }

    // Create new drawing element
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: selectedTool as Tool,
      points: [point],
      color: strokeColor,
      strokeWidth,
      opacity: 1,
    };

    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentPoint = getMousePos(canvas, e);

    // Handle hover detection for select tool
    if (selectedTool === "select" && !isDragging) {
      const hoveredEl = findElementAtPoint(currentPoint, elements);
      setHoveredElement(hoveredEl ? hoveredEl.id : null);
    }

    // Handle select tool dragging
    if (selectedTool === "select" && isDragging && selectedElement) {
      // Calculate new position
      const newX = currentPoint.x - dragOffset.x;
      const newY = currentPoint.y - dragOffset.y;

      // Calculate the delta for the move
      const currentElement = elements.find((el) => el.id === selectedElement);
      if (currentElement) {
        const deltaX = newX - currentElement.points[0].x;
        const deltaY = newY - currentElement.points[0].y;

        // Update element with new position using the broadcast function
        const newPoints = currentElement.points.map((p) => ({
          x: p.x + deltaX,
          y: p.y + deltaY,
        }));

        updateElementWithBroadcast(selectedElement, { points: newPoints });
      }
      return;
    }

    if (!isDrawing || !currentElement) return;

    if (selectedTool === "pen" || selectedTool === "eraser") {
      setCurrentElement((prev) =>
        prev
          ? {
              ...prev,
              points: [...prev.points, currentPoint],
            }
          : null
      );
    } else {
      // For shapes, only update the end point
      setCurrentElement((prev) =>
        prev
          ? {
              ...prev,
              points: [startPoint, currentPoint],
            }
          : null
      );
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getMousePos(canvas, e);
    const clickedElement = findElementAtPoint(point, elements);

    if (clickedElement && clickedElement.type === "text") {
      // Directly enter edit mode for text elements
      setSelectedElement(clickedElement.id);
      editSelectedElement();
    }
  };

  const handleMouseUp = () => {
    // Handle select tool
    if (selectedTool === "select" && isDragging) {
      setIsDragging(false);
      // Add moved element state to history
      addToHistory([...elements]);
      return;
    }

    if (!isDrawing || !currentElement) return;

    setIsDrawing(false);

    // Add the current element to elements and broadcast
    addElementWithBroadcast(currentElement);
    setCurrentElement(null);
  };

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onMouseLeave={() => setIsDrawing(false)}
        style={{
          background: backgroundColor,
          cursor:
            selectedTool === "select"
              ? hoveredElement &&
                elements.find((el) => el.id === hoveredElement)?.type === "text"
                ? "text"
                : hoveredElement
                  ? "move"
                  : "default"
              : selectedTool === "text"
                ? "text"
                : selectedTool === "eraser"
                  ? "crosshair"
                  : "crosshair",
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
