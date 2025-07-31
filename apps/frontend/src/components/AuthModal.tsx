import React, { useState } from "react";
import { Login } from "./Login";
import { Signup } from "./Signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "login",
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal content */}
          <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            {activeTab === "login" ? (
              <Login
                onSwitchToSignup={() => setActiveTab("signup")}
                onClose={onClose}
              />
            ) : (
              <Signup
                onSwitchToLogin={() => setActiveTab("login")}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
