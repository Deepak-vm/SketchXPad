import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

const wss = new WebSocketServer({ port: 8080 });

interface User {
    userId: string;
    connectionId: string; // Unique identifier for each WebSocket connection
    rooms: string[];
    ws: any;
}

const users: User[] = [];

function checkUser(token: string | null): string | null {
    if (!token) {
        return `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // If token starts with "anonymous_", it's a session ID, use it directly
    if (token.startsWith('anonymous_')) {
        return token;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
        return decoded.userId;
    } catch (error) {
        return token.startsWith('anonymous_') ? token : `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

wss.on('connection', function connection(ws, req) {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const userId = checkUser(token);

    if (userId == null) {
        ws.close(1008, "Unauthorized");
        return;
    }

    // Check if this user already has connections and copy their rooms
    const existingUser = users.find(u => u.userId === userId);
    const userRooms = existingUser ? [...existingUser.rooms] : [];

    // Generate unique connection ID
    const connectionId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    users.push({
        userId,
        connectionId,
        rooms: userRooms,
        ws
    });

    console.log(`User ${userId} (${connectionId}) connected. Total users: ${users.length}. Joined rooms: [${userRooms.join(', ')}]`);

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

                    // Broadcast participant count update to all users in the room
                    const usersInRoom = users.filter(u => u.rooms.includes(roomIdString));
                    const participantCount = usersInRoom.length;

                    usersInRoom.forEach(roomUser => {
                        try {
                            roomUser.ws.send(JSON.stringify({
                                type: "participantUpdate",
                                roomId: roomIdString,
                                participantCount: participantCount,
                                participants: usersInRoom.map(u => ({
                                    userId: u.userId,
                                    connectionId: u.connectionId
                                }))
                            }));
                        } catch (error) {
                            console.error(`Failed to send participant update to user ${roomUser.userId}:`, error);
                        }
                    });

                    console.log(`Broadcasted participant count (${participantCount}) to room ${roomIdString}`);
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
                const roomIdString = String(roomId);
                user.rooms = user.rooms.filter(x => x !== roomIdString);
                console.log(`User ${user.userId} left room: ${roomId}. User rooms: [${user.rooms.join(', ')}]`);

                // Broadcast participant count update to remaining users in the room
                const usersInRoom = users.filter(u => u.rooms.includes(roomIdString));
                const participantCount = usersInRoom.length;

                usersInRoom.forEach(roomUser => {
                    try {
                        roomUser.ws.send(JSON.stringify({
                            type: "participantUpdate",
                            roomId: roomIdString,
                            participantCount: participantCount,
                            participants: usersInRoom.map(u => ({
                                userId: u.userId,
                                connectionId: u.connectionId
                            }))
                        }));
                    } catch (error) {
                        console.error(`Failed to send participant update to user ${roomUser.userId}:`, error);
                    }
                });

                console.log(`Broadcasted participant count (${participantCount}) to room ${roomIdString} after user left`);
            }
        }

        if (parsedData.type === "shape") {
            const roomId = String(parsedData.roomId);
            const shape = parsedData.shape;
            const action = parsedData.action;

            // Find the current user (the one sending the shape)
            const currentUser = users.find(x => x.ws === ws);
            if (!currentUser) {
                console.log(`User not found for shape message`);
                return;
            }

            console.log(`Shape ${action} from user ${userId} in room ${roomId}: ${shape.type} (${shape.id})`);

            // Check if the current user is in the room
            if (!currentUser.rooms.includes(roomId)) {
                console.log(`User ${userId} is not in room ${roomId}. User rooms: [${currentUser.rooms.join(', ')}]`);
                return;
            }

            // Find users in the same room (excluding the sender by WebSocket instance)
            const allUsersInRoom = users.filter(user => user.rooms.includes(roomId));
            const usersInRoom = users.filter(user =>
                user.rooms.includes(roomId) && user.ws !== ws
            );

            console.log(`Total users in room ${roomId}: ${allUsersInRoom.length} [${allUsersInRoom.map(u => `${u.userId}(${u.connectionId})`).join(', ')}]`);
            console.log(`Broadcasting shape to users in room ${roomId}: ${usersInRoom.length} users [${usersInRoom.map(u => `${u.userId}(${u.connectionId})`).join(', ')}]`);

            // Broadcast shape to all other users in the room
            usersInRoom.forEach(user => {
                try {
                    user.ws.send(JSON.stringify({
                        type: "shape",
                        action: action,
                        shape: shape,
                        roomId,
                        userId,
                        timestamp: parsedData.timestamp
                    }));
                    console.log(`Shape broadcasted to user ${user.userId}(${user.connectionId})`);
                } catch (error) {
                    console.error(`Failed to send shape to user ${user.userId}(${user.connectionId}):`, error);
                }
            });
        }

        if (parsedData.type === "clear") {
            const roomId = String(parsedData.roomId);

            // Find the current user (the one sending the clear command)
            const currentUser = users.find(x => x.ws === ws);
            if (!currentUser) {
                console.log(`User not found for clear message`);
                return;
            }

            console.log(`Clear canvas from user ${userId} in room ${roomId}`);

            // Check if the current user is in the room
            if (!currentUser.rooms.includes(roomId)) {
                console.log(`User ${userId} is not in room ${roomId}. User rooms: [${currentUser.rooms.join(', ')}]`);
                return;
            }

            // Find users in the same room (excluding the sender by WebSocket instance)
            const usersInRoom = users.filter(user =>
                user.rooms.includes(roomId) && user.ws !== ws
            );
            console.log(`Broadcasting clear to users in room ${roomId}: ${usersInRoom.map(u => `${u.userId}(${u.connectionId})`).join(', ')}`);

            // Broadcast clear to all other users in the room
            usersInRoom.forEach(user => {
                try {
                    user.ws.send(JSON.stringify({
                        type: "clear",
                        roomId,
                        userId,
                        timestamp: parsedData.timestamp
                    }));
                    console.log(`Clear broadcasted to user ${user.userId}(${user.connectionId})`);
                } catch (error) {
                    console.error(`Failed to send clear to user ${user.userId}(${user.connectionId}):`, error);
                }
            });
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
            console.log(`All users and their rooms:`, users.map(u => `${u.userId}(${u.connectionId}): [${u.rooms.join(', ')}]`));

            // Check if the current user is in the room
            if (!currentUser.rooms.includes(roomId)) {
                console.log(`User ${userId} is not in room ${roomId}. User rooms: [${currentUser.rooms.join(', ')}]`);
                return;
            }

            // Find users in the same room
            const usersInRoom = users.filter(user => user.rooms.includes(roomId));
            console.log(`Users in room ${roomId}: ${usersInRoom.map(u => `${u.userId}(${u.connectionId})`).join(', ')}`);

            // Send message to all users in the room
            usersInRoom.forEach(user => {
                try {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId,
                        userId
                    }));
                    console.log(`Message sent to user ${user.userId}(${user.connectionId})`);
                } catch (error) {
                    console.error(`Failed to send message to user ${user.userId}(${user.connectionId}):`, error);
                }
            });
        }
    });

    ws.on('close', function close() {
        const userIndex = users.findIndex(x => x.ws === ws);
        if (userIndex !== -1) {
            const user = users[userIndex];
            if (user) {
                console.log(`User ${user.userId}(${user.connectionId}) disconnected. Total users: ${users.length - 1}`);

                // Broadcast participant count update to all rooms the user was in
                const userRooms = [...user.rooms]; // Copy rooms before removing user
                users.splice(userIndex, 1); // Remove user from users array

                // Update participant count for each room the user was in
                userRooms.forEach(roomId => {
                    const usersInRoom = users.filter(u => u.rooms.includes(roomId));
                    const participantCount = usersInRoom.length;

                    usersInRoom.forEach(roomUser => {
                        try {
                            roomUser.ws.send(JSON.stringify({
                                type: "participantUpdate",
                                roomId: roomId,
                                participantCount: participantCount,
                                participants: usersInRoom.map(u => ({
                                    userId: u.userId,
                                    connectionId: u.connectionId
                                }))
                            }));
                        } catch (error) {
                            console.error(`Failed to send participant update to user ${roomUser.userId}:`, error);
                        }
                    });

                    console.log(`Broadcasted participant count (${participantCount}) to room ${roomId} after user disconnected`);
                });
            } else {
                users.splice(userIndex, 1);
            }
        }
    });
});

console.log("WebSocket server is running on port 8080");

