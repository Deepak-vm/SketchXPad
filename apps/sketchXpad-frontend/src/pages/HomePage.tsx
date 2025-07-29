import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import banner from "../assets/banner.svg";

export function HomePage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const createNewRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 15);
    navigate(`/canvas/${newRoomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/canvas/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        {/* Logo and Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full shadow-sm p-2 border border-gray-200">
            <img src={logo} alt="SketchXPad Logo" className="w-16 h-16" />
          </div>

          <div>
            <img
              src={banner}
              alt="SketchXPad"
              className="w-64 h-16 object-contain mx-auto"
            />
          </div>

          <p className="text-gray-600 text-lg font-medium">
            Your creative canvas for collaborative drawing
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <button
            onClick={createNewRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Create New Room
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={joinRoom} className="space-y-3">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
            />
            <button
              type="submit"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Join Room
            </button>
          </form>
        </div>

        {/* Additional info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Create a room to start drawing or join an existing room with
            friends!
          </p>
          <div className="mt-4">
            <button
              onClick={() => navigate("/auth")}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in for saved drawings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
