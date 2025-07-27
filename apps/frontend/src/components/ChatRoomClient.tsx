"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
  messages,
  id,
}: {
  messages: { message: string }[];
  id: string;
}) {
  const [chats, setChats] = useState(messages);
  const [currentMessage, setCurrentMessage] = useState("");
  const [userName] = useState(localStorage.getItem("userName") || "Anonymous");
  const { socket, loading } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (socket && !loading) {
      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId: id,
        })
      );

      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "chat") {
          setChats((c) => [...c, { message: parsedData.message }]);
        }
      };
    }
  }, [socket, loading, id]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Room: {id}</h1>
            <p className="text-blue-100 text-sm">
              Welcome, {userName} •
              {loading ? (
                <span className="text-yellow-200"> Connecting...</span>
              ) : (
                <span className="text-green-200"> Connected</span>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          chats.map((m, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
            >
              <p className="text-gray-800">{m.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (currentMessage.trim() && !loading) {
                  socket?.send(
                    JSON.stringify({
                      type: "chat",
                      roomId: id,
                      message: currentMessage,
                      userName: userName,
                    })
                  );
                  setCurrentMessage("");
                }
              }
            }}
            placeholder={
              loading ? "Connecting to chat..." : "Type your message..."
            }
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => {
              if (currentMessage.trim() && !loading) {
                socket?.send(
                  JSON.stringify({
                    type: "chat",
                    roomId: id,
                    message: currentMessage,
                    userName: userName,
                  })
                );
                setCurrentMessage("");
              }
            }}
            disabled={!currentMessage.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {loading ? "Connecting..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
