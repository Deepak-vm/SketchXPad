import { z } from "zod";

export const CreateUserSchema = z.object({
    email: z.string().email().max(100), // Changed from username to email
    password: z.string().min(6).max(100),
    name: z.string().min(1).max(50).optional()
})

export const LoginUserSchema = z.object({
    email: z.string().email().max(100), // Changed from username to email
    password: z.string().min(6).max(100)
})

export const CreateRoomSchema = z.object({
    roomName: z.string().min(3).max(20)
})
