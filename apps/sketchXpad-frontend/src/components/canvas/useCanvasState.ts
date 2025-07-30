import { useState, useCallback, useEffect } from 'react';
import type { DrawingElement, Point } from './types';

export const useCanvasState = (initialElements: DrawingElement[] = []) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [elements, setElements] = useState<DrawingElement[]>(initialElements);
    const [history, setHistory] = useState<DrawingElement[][]>([initialElements]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
    const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
    const [isTyping, setIsTyping] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [textPosition, setTextPosition] = useState<Point | null>(null);
    const [showCursor, setShowCursor] = useState(true);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
    const [hoveredElement, setHoveredElement] = useState<string | null>(null);

    // Update elements when initialElements change
    useEffect(() => {
        if (initialElements.length > 0 && elements.length === 0) {
            setElements(initialElements);
            setHistory([initialElements]);
            setHistoryIndex(0);
        }
    }, [initialElements, elements.length]);

    const addToHistory = useCallback((newElements: DrawingElement[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const clearCanvas = useCallback(() => {
        setElements([]);
        setCurrentElement(null);
        setSelectedElement(null);
        addToHistory([]);
    }, [addToHistory]);

    const undoLastAction = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setElements(history[newIndex]);
            setSelectedElement(null);
        }
    }, [historyIndex, history]);

    const redoLastAction = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setElements(history[newIndex]);
            setSelectedElement(null);
        }
    }, [historyIndex, history]);

    const deleteSelectedElement = useCallback(() => {
        if (!selectedElement) return;

        const newElements = elements.filter(
            (element) => element.id !== selectedElement
        );
        setElements(newElements);
        setSelectedElement(null);
        addToHistory(newElements);
    }, [selectedElement, elements, addToHistory]);

    return {
        // State
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

        // Setters
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

        // Actions
        addToHistory,
        clearCanvas,
        undoLastAction,
        redoLastAction,
        deleteSelectedElement,
    };
};
