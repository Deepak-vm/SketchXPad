import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common';
import { middleware } from "./middleware.js";
import { CreateUserSchema, LoginUserSchema, CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";

const app = express();

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log('HTTP Backend starting...');
console.log('JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');


// API auth routes (for AuthContext)
app.post('/api/auth/signup', async (req: Request, res: Response) => {
    console.log('API Auth Signup Request received:', req.body);

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log('Validation failed:', parsedData.error);
        return res.status(400).json({
            message: "Invalid data"
        });
    }

    console.log('Validation passed, attempting to create user...');

    try {
        const user = await prisma.user.create({
            data: {
                email: parsedData.data.email!,
                password: parsedData.data.password!,
                name: parsedData.data.name!,
                photo: ""
            }
        });

        console.log('User created successfully:', user.id);

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(409).json({
            message: "User already exists with this email or database error"
        });
    }
});

app.post('/api/auth/signin', async (req: Request, res: Response) => {
    const parsedData = LoginUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data"
        });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: parsedData.data.email!,
                password: parsedData.data.password!,
            }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Error signing in"
        });
    }
});

app.get('/api/auth/me', middleware, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId!
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            user: {
                id: user.id,
                username: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user data"
        });
    }
});

app.get('/me', middleware, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId!
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user data"
        });
    }
});

app.post('/room', middleware, async (req: Request, res: Response) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.json({
            message: "Invalid data"
        });
    }

    try {
        const room = await prisma.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: req.userId!
            }
        });
        res.json({
            roomId: room.id
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating room"
        });
    }
});

app.get('/room/chats/:roomId', async (req, res) => {
    const roomId = Number(req.params.roomId);
    const messages = await prisma.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: 'asc'
        },
        take: 50
    });
    res.json({
        messages
    });
})

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});