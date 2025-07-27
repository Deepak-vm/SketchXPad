import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

interface Message {
  message: string;
  timestamp?: string;
  userId?: string;
}

function ChatRoomClient({ messages, id }: { messages: Message[]; id: string }) {
  const [chats, setChats] = useState<Message[]>(messages);
  const { socket, loading } = useSocket();

  useEffect(() => {
    console.log("🔄 ChatRoomClient useEffect triggered", {
      socket: !!socket,
      loading,
      roomId: id,
    });

    if (socket && !loading) {
      console.log("📤 Sending joinRoom message for room:", id);

      // Send joinRoom message
      socket.send(
        JSON.stringify({
          type: "joinRoom",
          roomId: id,
        })
      );

      // Listen for messages
      socket.onmessage = (event: MessageEvent) => {
        console.log("📨 Raw message received:", event.data);

        try {
          const parsedData = JSON.parse(event.data);
          console.log("📨 Parsed message:", parsedData);

          if (parsedData.type === "chat") {
            console.log("💬 Adding chat message to state:", parsedData);
            setChats((prev) => {
              const newChats = [
                ...prev,
                {
                  message: parsedData.message,
                  userId: parsedData.userId,
                  timestamp: new Date().toISOString(),
                },
              ];
              console.log("📝 Updated chats state:", newChats);
              return newChats;
            });
          }
        } catch (error) {
          console.error("❌ Error parsing message:", error);
        }
      };

      // Cleanup when component unmounts or room changes
      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          console.log("🚪 Leaving room:", id);
          socket.send(
            JSON.stringify({
              type: "leaveRoom",
              roomId: id,
            })
          );
        }
      };
    }
  }, [socket, loading, id]);

  // Function to send messages
  const sendMessage = (message: string) => {
    if (socket && message.trim()) {
      console.log("📤 Sending message:", message);
      socket.send(
        JSON.stringify({
          type: "chat",
          roomId: id,
          message: message,
        })
      );
    }
  };

  console.log("🎨 Rendering ChatRoomClient", { chats, loading });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Room: {id}</h2>

      {/* Connection Status */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <p>WebSocket Status: {loading ? "🔄 Connecting..." : "✅ Connected"}</p>
        <p>Messages Count: {chats.length}</p>
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-lg shadow-md p-4 max-h-96 overflow-y-auto mb-4">
        {chats.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet...</p>
        ) : (
          chats.map((msg, index) => (
            <div key={index} className="mb-2 p-2 border-b border-gray-200">
              <div className="text-sm text-gray-500">
                {msg.userId} -{" "}
                {new Date(msg.timestamp || "").toLocaleTimeString()}
              </div>
              <div className="font-medium">{msg.message}</div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={sendMessage} disabled={loading} />
    </div>
  );
}

// Message Input Component
function MessageInput({
  onSendMessage,
  disabled,
}: {
  onSendMessage: (msg: string) => void;
  disabled: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        Send
      </button>
    </form>
  );
}

export default ChatRoomClient;
