import type { DrawingElement, Point } from './types';

export interface HistoryActions {
    undoLastAction: () => void;
    redoLastAction: () => void;
    clearCanvas: () => void;
    deleteSelectedElement: () => void;
    editSelectedElement: () => void;
}

export const createKeyboardHandler = (
    selectedTool: string,
    selectedElement: string | null,
    isTyping: boolean,
    textPosition: Point | null,
    textInput: string,
    elements: DrawingElement[],
    actions: HistoryActions,
    setIsTyping: (typing: boolean) => void,
    setTextInput: React.Dispatch<React.SetStateAction<string>>,
    setTextPosition: (position: Point | null) => void,
    addTextElement: (text: string, position: Point) => void
) => {
    return (e: KeyboardEvent) => {
        // Handle undo/redo shortcuts
        if (e.ctrlKey || e.metaKey) {
            if (e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                actions.undoLastAction();
                return;
            } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
                e.preventDefault();
                actions.redoLastAction();
                return;
            }
        }

        // Handle delete selected element
        if (
            (e.key === "Delete" || e.key === "Backspace") &&
            selectedElement &&
            selectedTool === "select"
        ) {
            e.preventDefault();
            actions.deleteSelectedElement();
            return;
        }

        // Handle edit selected text element with Enter key
        if (
            e.key === "Enter" &&
            selectedElement &&
            selectedTool === "select" &&
            !isTyping
        ) {
            e.preventDefault();
            const element = elements.find((el) => el.id === selectedElement);
            if (element && element.type === "text") {
                actions.editSelectedElement();
            }
            return;
        }

        // Handle text input when text tool is selected and we're typing
        if (selectedTool === "text" && isTyping && textPosition) {
            if (e.key === "Enter") {
                // Finish typing and create the text element
                if (textInput.trim()) {
                    addTextElement(textInput.trim(), textPosition);
                }

                // Reset text input state
                setIsTyping(false);
                setTextInput("");
                setTextPosition(null);
            } else if (e.key === "Escape") {
                // Cancel text input
                setIsTyping(false);
                setTextInput("");
                setTextPosition(null);
            } else if (e.key === "Backspace") {
                e.preventDefault();
                setTextInput((prev) => prev.slice(0, -1));
            } else if (e.key.length === 1) {
                // Add regular characters
                e.preventDefault();
                setTextInput((prev) => prev + e.key);
            }
        }
    };
};
