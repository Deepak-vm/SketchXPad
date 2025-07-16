import express from "express";
import jwt from "jsonwebtoken"; 
import { JWT_SECRET } from "./config.js";
import { middleware } from "./middleware.js";

const app = express();

app.post('/signup', (req, res) => {
    res.send("Signup successful");
});

app.post('/signin', (req, res) => {
    res.send("Signin successful");
    const userId = 1;
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({token})
});

app.post('/room',middleware , (req, res) => {
    res.send("Room created successfully");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});