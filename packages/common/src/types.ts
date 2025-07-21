import {z} from "zod";

export const CreateUserSchema = z.object({
    username:z.string().min(3).max(20),
    password:z.string().min(6).max(100),
    name:z.string().min(3).max(50).optional()
})


export const LoginUserSchema = z.object({
    username:z.string().min(3).max(20),
    password:z.string().min(6).max(100)
})


export const CreateRoomSchema = z.object({
    roomName:z.string().min(3).max(20)
})
