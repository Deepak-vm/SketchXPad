import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common';

const wss = new WebSocketServer({ port: 8080 });

interface CustomJwtPayload extends JwtPayload {
    userId: number;
}

wss.on('connection', function connection(ws: WebSocket, request: IncomingMessage) {
    const url = request.url;
    if (!url) {
        return;
    }
    //Splits url by ? into array 
    const params = new URLSearchParams(url.split('?')[1]);
    const token = params.get('token') || "";

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
        if (!decoded || !decoded.userId) {
            ws.close(1008, "Unauthorized");
            return;
        }

        ws.on('message', function message(data) {
            console.log('Received:', data.toString());
            ws.send('hello ' + decoded.userId);
        });

    } catch (error) {
        ws.close(1008, "Unauthorized");
        return;
    }
});

console.log("WebSocket server is running on port 8080");
