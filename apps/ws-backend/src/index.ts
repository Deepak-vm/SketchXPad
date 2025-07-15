import express, { Request, Response } from "express";

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.send("WebSocket backend is running");
});

app.listen(3001, () => {
    console.log("WebSocket server is running on port 3001");
});
