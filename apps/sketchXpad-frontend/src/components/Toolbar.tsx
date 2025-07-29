import React from "react";
import type { Tool } from "./DrawingCanvas";

interface ToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: "select", label: "Select", icon: "↖️" },
  { id: "pen", label: "Pen", icon: "✏️" },
  { id: "rectangle", label: "Rectangle", icon: "▭" },
  { id: "circle", label: "Circle", icon: "○" },
  { id: "line", label: "Line", icon: "📏" },
  { id: "arrow", label: "Arrow", icon: "➡️" },
  { id: "text", label: "Text", icon: "🔤" },
  { id: "eraser", label: "Eraser", icon: "🧽" },
];

const colors = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
  "#808080",
  "#000080",
  "#008000",
];

const backgroundColors = [
  "#FFFFFF",
  "#F8F9FA",
  "#E9ECEF",
  "#DEE2E6",
  "#CED4DA",
  "#ADB5BD",
  "#6C757D",
  "#495057",
  "#343A40",
  "#212529",
  "#FFF3CD",
  "#D4EDDA",
  "#D1ECF1",
  "#F8D7DA",
  "#E2E3E5",
];

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  opacity,
  onOpacityChange,
  backgroundColor,
  onBackgroundColorChange,
}) => {
  return (
    <>
      {/* Toolbar */}
      {
        <div className="bg-white border-r border-gray-200 p-4 flex flex-col gap-6 w-64 h-full overflow-y-auto">
          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  className={`p-2 rounded-md border-2 transition-all duration-200 flex items-center justify-center min-h-[2.5rem] ${
                    selectedTool === tool.id
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                  title={tool.label}
                >
                  <span className="text-base">{tool.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Colors */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Stroke Color
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-6 h-6 rounded border-2 transition-all duration-200 ${
                    selectedColor === color
                      ? "border-gray-800 scale-110"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Background Colors */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Background
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {backgroundColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onBackgroundColorChange(color)}
                  className={`w-6 h-6 rounded border-2 transition-all duration-200 ${
                    backgroundColor === color
                      ? "border-gray-800 scale-110"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Stroke Width: {strokeWidth}px
            </h3>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1px</span>
              <span>20px</span>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Opacity: {Math.round(opacity * 100)}%
            </h3>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Preview
            </h3>
            <div
              className="w-full h-12 rounded-lg border border-gray-300 flex items-center justify-center"
              style={{ backgroundColor }}
            >
              <div
                className="w-16 h-1 rounded"
                style={{
                  backgroundColor: selectedColor,
                  height: `${strokeWidth}px`,
                  opacity,
                }}
              />
            </div>
          </div>
        </div>
      }
    </>
  );
};
