import { useState } from "react";
import { useParams } from "react-router-dom";
import DrawingCanvas, { type Tool } from "../../components/DrawingCanvas";
import { Toolbar } from "../../components/Toolbar";
import { Header } from "../../components/Header";

export default function Canvas() {
  const { roomId } = useParams<{ roomId: string }>();

  // Drawing state
  const [selectedTool, setSelectedTool] = useState<Tool>("pen");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "SketchXPad Room",
        text: `Join my drawing session on SketchXPad!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Room link copied to clipboard!");
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export functionality coming soon!");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        roomId={roomId || "unknown"}
        participants={1}
        onShare={handleShare}
        onExport={handleExport}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          opacity={opacity}
          onOpacityChange={setOpacity}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={setBackgroundColor}
        />

        {/* Canvas area */}
        <div className={`flex-1 relative transition-all duration-300`}>
          <DrawingCanvas
            selectedTool={selectedTool}
            strokeColor={selectedColor}
            strokeWidth={strokeWidth}
            backgroundColor={backgroundColor}
            onToolChange={setSelectedTool}
          />
        </div>
      </div>
    </div>
  );
}
