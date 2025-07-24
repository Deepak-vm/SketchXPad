import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";

// Extend Express Request type to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

interface CustomJwtPayload extends JwtPayload {
    userId: string; 
}

export function middleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    let token = "";

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); 
    } else if (authHeader) {
        token = authHeader; 
    }

    if (!token) {
        return res.status(403).json({
            message: "No token provided"
        });
    }

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
        console.log('Token verification error:', error);
        res.status(403).json({
            message: "Invalid token"
        });
    }
}

