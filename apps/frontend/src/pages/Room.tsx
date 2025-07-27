import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ChatRoomClient from "../components/ChatRoomClient";

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
    return <div className="text-center">Loading room...</div>;
  }

  if (!roomId) {
    return <div className="text-center">Room ID not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ChatRoomClient messages={messages} id={roomId} />
    </div>
  );
}

export default Room;
