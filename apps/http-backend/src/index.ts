import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common';
import { middleware } from "./middleware.js";
import {CreateUserSchema} from "@repo/common/src/types"

const app = express();
app.use(express.json());

app.post('/signup', (req: Request, res: Response) => {
    const data = CreateUserSchema.safeParse(req.body);
    if(!data.success) {
        return res.json({
            message: "Invalid data"
        });
    }return    
});

app.post('/signin', (req: Request, res: Response) => {
    const userId = 1;
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({ token });
});

app.post('/room', middleware, (req: Request, res: Response) => {
    //db call
    res.json({
        roomId: 123
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});