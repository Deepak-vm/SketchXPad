import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "../components/AuthModal";
import logo from "../assets/logo.svg";
import banner from "../assets/banner.svg";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleJoinRoom = () => {
    if (!isAuthenticated) {
      setAuthModalTab("login");
      setIsAuthModalOpen(true);
      return;
    }

    if (roomId.trim()) {
      // Use authenticated user's name
      navigate(`/room/${roomId}`);
      console.log("Joining room:", roomId, "as", user?.name);
    }
  };

  const handleCreateRoom = () => {
    if (!isAuthenticated) {
      setAuthModalTab("login");
      setIsAuthModalOpen(true);
      return;
    }

    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${newRoomId}`);
    console.log("Created room:", newRoomId, "for", user?.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-10 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

        <div className="relative z-10">
          {/* User Info */}
          {isAuthenticated && (
            <div className="flex items-center justify-between mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-green-600">Logged in</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}

          <div className="text-center mb-10">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-24 h-24  rounded-2xl">
              <img src={logo} alt="SketchXPad Logo" className="w-20 h-20" />
            </div>

            {/* Banner */}
            <div className="flex items-center justify-center">
              <img
                src={banner}
                alt="SketchXPad Banner"
                className="w-64 h-16 object-contain filter drop-shadow-sm"
              />
            </div>

            <p className="text-gray-600 text-sm font-medium">
              {isAuthenticated
                ? "Enter a room ID to start collaborating"
                : "Sign in to create or join rooms"}
            </p>
          </div>

          {/* Auth required message for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 text-blue-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Authentication Required
                </p>
                <p className="text-xs text-blue-600 mb-3">
                  Please sign in to create or join drawing rooms
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setAuthModalTab("login");
                      setIsAuthModalOpen(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab("signup");
                      setIsAuthModalOpen(true);
                    }}
                    className="flex-1 bg-white hover:bg-gray-50 text-blue-600 text-sm font-medium py-2 px-4 rounded-md border border-blue-300 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form - only show for authenticated users */}
          {isAuthenticated && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Room ID
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter Room ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={!roomId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Join Room
              </button>
            </div>
          )}

          {/* Divider - only show for authenticated users */}
          {isAuthenticated && (
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">or</span>
              </div>
            </div>
          )}

          {/* Create Room - only show for authenticated users */}
          {isAuthenticated && (
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">Don't have a room?</p>
              <button
                onClick={handleCreateRoom}
                className="inline-flex items-center px-6 py-2 bg-white hover:bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create New Room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}

export default Home;
