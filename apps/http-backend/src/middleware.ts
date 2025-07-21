import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";

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

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
        if (decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            res.status(403).json({
                message: "Unauthorized"
            });
        }
    } catch (error) {
        res.status(403).json({
            message: "Invalid token"
        });
    }
}

