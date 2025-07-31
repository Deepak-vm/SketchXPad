import { useState, useCallback, useEffect } from 'react';
import type { DrawingElement, Point } from './types';

export const useCanvasState = (
    initialElements: DrawingElement[] = [],
    onShapeChange?: (shape: DrawingElement, action: 'draw' | 'update' | 'delete') => void,
    onClear?: () => void
) => {
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

    // Enhanced setElements to broadcast changes
    const setElementsWithBroadcast = useCallback((newElements: DrawingElement[], broadcastAction?: { shape: DrawingElement, action: 'draw' | 'update' | 'delete' }) => {
        setElements(newElements);
        if (broadcastAction && onShapeChange) {
            onShapeChange(broadcastAction.shape, broadcastAction.action);
        }
    }, [onShapeChange]);

    const clearCanvas = useCallback(() => {
        setElements([]);
        setCurrentElement(null);
        setSelectedElement(null);
        addToHistory([]);
        if (onClear) {
            onClear();
        }
    }, [addToHistory, onClear]);

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

        const elementToDelete = elements.find(el => el.id === selectedElement);
        const newElements = elements.filter(
            (element) => element.id !== selectedElement
        );
        setElements(newElements);
        setSelectedElement(null);
        addToHistory(newElements);

        // Broadcast deletion
        if (elementToDelete && onShapeChange) {
            onShapeChange(elementToDelete, 'delete');
        }
    }, [selectedElement, elements, addToHistory, onShapeChange]);

    // Function to add element and broadcast
    const addElementWithBroadcast = useCallback((element: DrawingElement) => {
        const newElements = [...elements, element];
        setElements(newElements);
        addToHistory(newElements);
        if (onShapeChange) {
            onShapeChange(element, 'draw');
        }
    }, [elements, addToHistory, onShapeChange]);

    // Function to update element and broadcast
    const updateElementWithBroadcast = useCallback((elementId: string, updates: Partial<DrawingElement>) => {
        const newElements = elements.map(el =>
            el.id === elementId ? { ...el, ...updates } : el
        );
        const updatedElement = newElements.find(el => el.id === elementId);
        setElements(newElements);
        addToHistory(newElements);
        if (updatedElement && onShapeChange) {
            onShapeChange(updatedElement, 'update');
        }
    }, [elements, addToHistory, onShapeChange]);

    // Function to receive remote changes (from other users)
    const applyRemoteChange = useCallback((shape: DrawingElement, action: 'draw' | 'update' | 'delete') => {
        setElements(prevElements => {
            let newElements = [...prevElements];

            switch (action) {
                case 'draw':
                    // Only add if not already exists
                    if (!newElements.find(el => el.id === shape.id)) {
                        newElements.push(shape);
                    }
                    break;
                case 'update':
                    newElements = newElements.map(el =>
                        el.id === shape.id ? shape : el
                    );
                    break;
                case 'delete':
                    newElements = newElements.filter(el => el.id !== shape.id);
                    break;
            }

            return newElements;
        });
    }, []);

    const applyRemoteClear = useCallback(() => {
        setElements([]);
        setCurrentElement(null);
        setSelectedElement(null);
    }, []);

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
        setElements: setElementsWithBroadcast,
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

        // Broadcasting functions
        addElementWithBroadcast,
        updateElementWithBroadcast,
        applyRemoteChange,
        applyRemoteClear,
    };
};
