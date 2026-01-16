import React from "react";
import logo from "../assets/logo.svg";
import banner from "../assets/banner.svg";

interface HeaderProps {
  roomId: string;
  participants?: number;
  connected?: boolean;
  onShare?: () => void;
  onExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  participants = 1,
  connected = false,
  onShare,
  onExport,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Left section - Logo and Room Info */}
      <div className="flex items-center">
        <div className="flex items-center">
          <img src={logo} alt="SketchXPad" className="w-8 h-12" />
          <img src={banner} alt="banner" className="w-40 h-12" />
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Room:</span>
          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
            {roomId}
          </code>
        </div>
      </div>

      {/* Right section - Participants and Actions */}
      <div className="flex items-center gap-4">
        {/* Participants count */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connected && participants > 0 ? "bg-green-400" : "bg-gray-400"}`}
          ></div>
          <span className="text-sm text-gray-600">
            {connected
              ? `${participants} participant${participants !== 1 ? "s" : ""} online`
              : "Connecting..."}
          </span>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Share
          </button>

          <button
            onClick={onExport}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Export
          </button>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>
    </header>
  );
};
