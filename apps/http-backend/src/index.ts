import express from "express";
import jwt from "jsonwebtoken"; 
import { JWT_SECRET } from "./config.js";
import { middleware } from "./middleware.js";

const app = express();

app.post('/signup', (req, res) => {
    //db call
    res.json({
        UserId: "123"
    });
    res.send("Signup successful");
});

app.post('/signin', (req, res) => {
    res.send("Signin successful");
    const userId = 1;
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({token})
});

app.post('/room',middleware , (req, res) => {
    //db call
    res.json({
        roomId: 123
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});