import {WebSocketServer , WebSocket} from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from './config.js';
import { decode } from 'punycode';
const wss = new WebSocketServer({port: 8080});

wss.on('connection' , function connection(ws , request) {
    const url = request.url;
    if(!url){
        return ;
    }
    //Splits url by ? into array 
    const params = new URLSearchParams(url.split('?')[1]);
    const token = params.get('token')|| "";    
    const decoded = jwt.verify(token , JWT_SECRET)
    if(!decoded || !(decoded as JwtPayload).userId){
        ws.close(1008 , "Unauthorized");
        return;
    }
    ws.on('message', function message(data) {
        ws.send('hello ');
    });
});