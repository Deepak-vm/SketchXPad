import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common';
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (typeof decoded === "string") {
            return null;
        }

        if (!decoded || !decoded.userId) {
            return null;
        }
        return String(decoded.userId);
    } catch (e) {
        return null;
    }
}

wss.on('connection', function connection(ws: WebSocket, request: IncomingMessage) {
    const url = request.url;
    if (!url) {
        ws.close(1002, "No URL");
        return;
    }

    const urlParts = url.split('?');
    if (urlParts.length < 2) {
        ws.close(1002, "No token parameter");
        return;
    }

    const queryParams = new URLSearchParams(urlParts[1]);
    const token = queryParams.get('token') || "";

    if (!token) {
        ws.close(1002, "No token");
        return;
    }

    const userId = checkUser(token);

    if (userId == null) {
        ws.close(1008, "Unauthorized");
        return;
    }

    // Check if this user already has connections and copy their rooms
    const existingUser = users.find(u => u.userId === userId);
    const userRooms = existingUser ? [...existingUser.rooms] : [];

    users.push({
        userId,
        rooms: userRooms,
        ws
    });

    console.log(`User ${userId} connected. Total users: ${users.length}. Joined rooms: [${userRooms.join(', ')}]`);

    ws.on('message', async function message(data) {
        let parsedData;
        try {
            if (typeof data !== "string") {
                parsedData = JSON.parse(data.toString());
            } else {
                parsedData = JSON.parse(data);
            }
        } catch (error) {
            return;
        }

        if (parsedData.type === "joinRoom") {
            const user = users.find(x => x.ws === ws);
            if (user) {
                const roomId = parsedData.roomId || parsedData.room;
                if (roomId) {
                    const roomIdString = String(roomId);
                    if (!user.rooms.includes(roomIdString)) {
                        user.rooms.push(roomIdString);
                    }
                    console.log(`User ${user.userId} joined room: ${roomId}. User rooms: [${user.rooms.join(', ')}]`);
                } else {
                    console.log(`Invalid joinRoom message: missing roomId/room`);
                }
            } else {
                console.log(`User not found for joinRoom`);
            }
        }

        if (parsedData.type === "leaveRoom") {
            const user = users.find(x => x.ws === ws);
            if (user) {
                const roomId = parsedData.roomId || parsedData.room;
                user.rooms = user.rooms.filter(x => x !== String(roomId));
                console.log(`User ${user.userId} left room: ${roomId}. User rooms: [${user.rooms.join(', ')}]`);
            }
        }

        if (parsedData.type === "chat") {
            const roomId = String(parsedData.roomId);
            const message = parsedData.message;

            // Find the current user (the one sending the message)
            const currentUser = users.find(x => x.ws === ws);
            if (!currentUser) {
                console.log(`User not found for chat message`);
                return;
            }

            console.log(`Chat message from user ${userId} in room ${roomId}: "${message}"`);
            console.log(`All users and their rooms:`, users.map(u => `${u.userId}: [${u.rooms.join(', ')}]`));

            // Check if the current user is in the room
            if (!currentUser.rooms.includes(roomId)) {
                console.log(`User ${userId} is not in room ${roomId}. User rooms: [${currentUser.rooms.join(', ')}]`);
                return;
            }

            // Find users in the same room
            const usersInRoom = users.filter(user => user.rooms.includes(roomId));
            console.log(`Users in room ${roomId}: ${usersInRoom.map(u => u.userId).join(', ')}`);

            try {
                await prisma.chat.create({
                    data: {
                        roomId: parseInt(roomId),
                        message,
                        userId
                    }
                });

                // Send message to all users in the room
                usersInRoom.forEach(user => {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId,
                        userId
                    }));
                    console.log(`Message sent to user ${user.userId}`);
                });
            } catch (error) {
                console.log('Error saving chat message:', error);
            }
        }
    });

    ws.on('close', function close() {
        const userIndex = users.findIndex(x => x.ws === ws);
        if (userIndex !== -1) {
            const user = users[userIndex];
            if (user) {
                console.log(`User ${user.userId} disconnected. Total users: ${users.length - 1}`);
            }
            users.splice(userIndex, 1);
        }
    });
});

console.log("WebSocket server is running on port 8080");

