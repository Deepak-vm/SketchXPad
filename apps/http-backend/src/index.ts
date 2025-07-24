import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common';
import { middleware } from "./middleware.js";
import { CreateUserSchema, LoginUserSchema, CreateRoomSchema } from "@repo/common/types"; // Use the exported path
import { prisma } from "@repo/db/client"; // Use the exported path

const app = express();
app.use(express.json());

app.post('/signup', async (req: Request, res: Response) => {
    console.log('Request body:', req.body);
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.json({
            message: "Invalid data"
        });
    }

    try {
        const user = await prisma.user.create({
            data: {
                email: parsedData.data.email!,
                password: parsedData.data.password!,
                name: parsedData.data.name!,
                photo: ""
            }
        })
        res.json({
            userId: user.id
        });

    } catch (error) {
        res.status(411).json({
            message: "User already exists with this email"
        })
    }
});

app.post('/signin', async (req: Request, res: Response) => {
    const parsedData = LoginUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.json({
            message: "Invalid data"
        });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: parsedData.data.email!,
                password: parsedData.data.password!,
            }
        })
        if (!user) {
            return res.json({ message: "User not found" });
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token });

    } catch (error) {
        res.status(411).json({
            message: "Error signing in"
        })
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

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});