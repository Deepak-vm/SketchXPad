import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HTTP_URL } from "../.config";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.svg";
import banner from "../assets/banner.svg";

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout: authLogout, isAuthenticated } = useAuth();
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const userType = localStorage.getItem("userType");
  const token = localStorage.getItem("token");

  const createNewRoom = async () => {
    if (userType === "guest") {
      // For guest users, create room without backend
      const newRoomId = Math.random().toString(36).substring(2, 15);
      navigate(`/canvas/${newRoomId}`);
      return;
    }

    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${HTTP_URL}/room`,
        { roomName: roomName.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.roomId) {
        navigate(`/canvas/${response.data.roomId}`);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/canvas/${roomId.trim()}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    if (isAuthenticated) {
      authLogout();
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {userType === "guest" ? (
              "Guest Mode"
            ) : isAuthenticated && user ? (
              <div>
                <div className="font-medium text-gray-800">Welcome back!</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            ) : (
              "Authenticated User"
            )}
          </div>
          {userType !== "guest" && (
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          )}
        </div>

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

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-4">
          {userType === "guest" ? (
            <button
              onClick={createNewRoom}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Room..." : "Create New Room (Guest)"}
            </button>
          ) : (
            <>
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  Create New Room
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter room name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
                    disabled={isLoading}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={createNewRoom}
                      disabled={isLoading || !roomName.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Creating..." : "Create"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setRoomName("");
                        setError("");
                      }}
                      disabled={isLoading}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

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
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
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
          {userType === "guest" && (
            <div className="mt-4">
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in for saved drawings →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
