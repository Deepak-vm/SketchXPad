import { useState } from "react";
import logo from "../assets/logo.svg";
import banner from "../assets/banner.svg";
import { SignIn, SignUp } from "../components/Auth";

function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg transition-all duration-500 border border-gray-200">
        {/* Logo and Banner - Always visible */}
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

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab("signin")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "signin"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "signup"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Conditionally render forms based on activeTab */}
        {activeTab === "signin" && <SignIn />}
        {activeTab === "signup" && <SignUp />}
      </div>
    </div>
  );
}

export { AuthPage };