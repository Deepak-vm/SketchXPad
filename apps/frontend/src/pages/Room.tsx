import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { ChatRoomClient } from "../components/ChatRoomClient";

interface Message {
  message: string;
  timestamp?: string;
  userId?: string;
}

async function getChats(roomId: string): Promise<Message[]> {
  try {
    const response = await api.get(`/room/chats/${roomId}`);
    return response.data.messages || [];
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId) {
      getChats(roomId).then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      });
    }
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-800 text-xl font-semibold">
            Room ID not found
          </p>
          <p className="text-gray-600 mt-2">
            Please check the URL and try again
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <ChatRoomClient messages={messages} id={roomId} />
    </div>
  );
}

export default Room;
