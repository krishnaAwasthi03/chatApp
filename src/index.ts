import { connection, server} from "websocket";
import express, {Express , Request , Response} from "express"
import http from "http"
import { IncomingMessage, MessageType } from "./messages/incomingMesseages";
import { inMemoryStore } from "./store/inMemoryStore";
import { Chat, Store } from "./store/Store";
import { UesrManager } from "./UserManager";
import { OutgoingMessage, SupportedMessageOutgoing } from "./messages/outgoingMessages";

const app : Express = express();

const store : Store = new inMemoryStore()
const userManager : UesrManager  = new UesrManager()

var httpServer : http.Server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
    }
);

app.get('/' , (req, res)=> {
    res.json({user : [userManager.getUser("1" , "1"), userManager.getUser("1" , "2")]})
})

app.listen(3000, () =>{ 
    console.log("server runing smoothly");
})
httpServer.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

let wsServer = new server({
    httpServer,
    autoAcceptConnections: false
});

function originIsAllowed(origin : any) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    var ws:connection = request.accept('echo-protocol',request.origin);
    console.log((new Date()) + ' Connection accepted.');
    ws.on('message', function(message : any) {
        if (message.type === 'utf8') {
           messageHandler(JSON.parse(message.utf8Data) ,ws)
        }
    });
    ws.on('close', function(reasonCode:any, description:any) {
        console.log((new Date()) + ' Peer ' + ws.remoteAddress + ' disconnected.');
    });
});

function messageHandler(message : IncomingMessage , ws : connection ){
    if (message.type === MessageType.Join_Room) {
        const payload = message.payload
        userManager.addUser(payload.name, payload.userId , payload.roomId ,ws)  
        store.initRoom(payload.roomId)
    }
    if (message.type === MessageType.Send_Message) {
        const payload = message.payload
        const user = userManager.getUser(payload.roomId , payload.userId)
        if (!user) {
            console.error("User not found in the room")
            return;
        }
        const chat = store.addChat(payload.roomId , user.id, user.name , payload.message)
        // ? brodcast logic
        if(chat == null){
            return;
        }
        const outgoingMessage : OutgoingMessage = {
            type : SupportedMessageOutgoing.AddChat,
            payload: {
                chatId: chat.id,
                roomId : payload.roomId,
                message : payload.message,
                name: user.name,
                upvotes: 0 
            }
        }
        userManager.broadcastMessage(payload.roomId , payload.userId,  outgoingMessage)

    }
    if (message.type === MessageType.Upvote_Message) {
        const payload = message.payload
        const user = userManager.getUser(payload.roomId , payload.userId)
        const chat:Chat | null = store.upVote(payload.roomId, payload.chatId , payload.userId)
        if (chat == null) {
            return;
        }
        const outgoingMessage : OutgoingMessage = {
            type : SupportedMessageOutgoing.UpdateChat,
            payload: {
                chatId: payload.chatId ,
                name: user?.name,
                upvotes: chat.upvotes.length
            }
        }
        userManager.broadcastMessage(payload.roomId , payload.userId,  outgoingMessage)
    }
}
