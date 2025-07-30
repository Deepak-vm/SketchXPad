import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DrawingCanvas, { type Tool } from "../../DrawingCanvas";
import { Toolbar } from "../../Toolbar";
import { Header } from "../../Header";
import type { DrawingElement } from "../types";
import axios from "axios";
import { HTTP_URL } from "../../../.config";

export default function Canvas() {
  const { roomId } = useParams<{ roomId: string }>();

  // Drawing state
  const [selectedTool, setSelectedTool] = useState<Tool>("pen");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [existingShapes, setExistingShapes] = useState<DrawingElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Function to fetch existing shapes for the room
  const fetchExistingShapes = async (
    roomId: string
  ): Promise<DrawingElement[]> => {
    try {
      const res = await axios.get(`${HTTP_URL}/chats/${roomId}`);
      const messages = res.data.messages;
      const shapes: DrawingElement[] = messages.map(
        (x: { message: string }) => {
          const messageData = JSON.parse(x.message);
          return messageData as DrawingElement;
        }
      );
      return shapes;
    } catch (error) {
      console.error("Error fetching existing shapes:", error);
      // For demonstration, return some mock data when backend is not available
      if (roomId === "demo") {
        return [
          {
            id: "1",
            type: "rectangle",
            points: [
              { x: 100, y: 100 },
              { x: 200, y: 200 },
            ],
            color: "#ff0000",
            strokeWidth: 2,
            opacity: 1,
          },
          {
            id: "2",
            type: "text",
            points: [{ x: 250, y: 150 }],
            color: "#0000ff",
            strokeWidth: 2,
            opacity: 1,
            text: "Welcome to SketchXPad!",
          },
        ];
      }
      return [];
    }
  };

  // Load existing shapes when component mounts
  useEffect(() => {
    const loadShapes = async () => {
      if (roomId) {
        setIsLoading(true);
        try {
          const shapes = await fetchExistingShapes(roomId);
          setExistingShapes(shapes);
        } catch (error) {
          console.error("Failed to load existing shapes:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadShapes();
  }, [roomId]);

  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export functionality coming soon!");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

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
            initialElements={existingShapes}
          />
        </div>
      </div>
    </div>
  );
}
