import { useEffect, useState, useCallback } from "react";
import { WS_URL } from "../.config";
import type { DrawingElement } from "../components/canvas/types";

export function useDrawingSocket(roomId: string) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [participantCount, setParticipantCount] = useState(1);

    useEffect(() => {
        if (!roomId) return;

        // Generate a unique session ID for anonymous users
        let token = localStorage.getItem("token");
        if (!token || token === "anonymous") {
            const sessionId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("token", sessionId);
            token = sessionId;
        }

        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            console.log(`WebSocket connected, joining room: ${roomId}`);
            setLoading(false);
            setConnected(true);
            setSocket(ws);

            // Join the drawing room
            ws.send(JSON.stringify({
                type: "joinRoom",
                roomId: roomId
            }));

            console.log(`Connected to drawing room: ${roomId}`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "participantUpdate" && data.roomId === roomId) {
                    console.log("Participant count update:", data.participantCount, "participants:", data.participants);
                    setParticipantCount(data.participantCount);
                }
            } catch (error) {
                console.error("Error parsing participant update:", error);
            }
        };

        ws.onclose = () => {
            setConnected(false);
            setSocket(null);
            setParticipantCount(0); // Reset participant count when disconnected
            console.log(`Disconnected from drawing room: ${roomId}`);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setLoading(false);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "leaveRoom",
                    roomId: roomId
                }));
            }
            ws.close();
        };
    }, [roomId]);

    const broadcastShape = useCallback((shape: DrawingElement, action: 'draw' | 'update' | 'delete') => {
        if (socket && connected) {
            const message = {
                type: "shape",
                roomId: roomId,
                action: action,
                shape: shape,
                timestamp: Date.now()
            };
            console.log("Broadcasting shape:", message);
            socket.send(JSON.stringify(message));
        } else {
            console.log("Cannot broadcast shape - socket not connected:", { socket: !!socket, connected });
        }
    }, [socket, connected, roomId]);

    const broadcastClear = useCallback(() => {
        if (socket && connected) {
            const message = {
                type: "clear",
                roomId: roomId,
                timestamp: Date.now()
            };
            console.log("Broadcasting clear:", message);
            socket.send(JSON.stringify(message));
        } else {
            console.log("Cannot broadcast clear - socket not connected:", { socket: !!socket, connected });
        }
    }, [socket, connected, roomId]);

    return {
        socket,
        loading,
        connected,
        participantCount,
        broadcastShape,
        broadcastClear
    };
}
