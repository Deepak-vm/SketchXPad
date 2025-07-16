import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "./config.js";

// Extend Express Request type to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}
interface CustomJwtPayload extends JwtPayload {
    userId: number;
}

export function middleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    if (decoded.userId) {
        req.userId = decoded.userId;
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}

