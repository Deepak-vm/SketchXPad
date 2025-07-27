import { useState, useEffect } from 'react';
import { WS_URL } from "../config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        // For testing, use a dummy JWT token - replace with real auth later
        const testToken = localStorage.getItem('authToken') || 'dummy-jwt-token';

        console.log('Connecting to WebSocket with URL:', `${WS_URL}?token=${testToken}`);

        const ws = new WebSocket(`${WS_URL}?token=${testToken}`);

        ws.onopen = () => {
            console.log('✅ WebSocket connected successfully');
            setLoading(false);
            setSocket(ws);
        };

        ws.onclose = (event) => {
            console.log('❌ WebSocket disconnected:', event.code, event.reason);
            setLoading(true);
            setSocket(null);
        };

        ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            setLoading(true);
            setSocket(null);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    return { loading, socket };
}