import { connection } from "websocket";
import { OutgoingMessage} from "./messages/outgoingMessages";

export type User = {
    id: string,
    name: string,
    websocket : connection
}

export interface Room {
    user: User[]
}

export class UesrManager {
    private users: Map<string, Room>
    constructor() {
        this.users = new Map<string, Room>();
    }
    addUser(name: string, userId: string, roomId: string, ws: connection) {
        let user: User = {
            id: userId,
            name,
            websocket : ws
        }
        if (!this.users.get(roomId)) {
            this.users.set(roomId, { 
                user: []
            })
        }
        const room = this.users.get(roomId)
        room?.user.push(user)
    }
    removeUser(userId: string, roomId: string) {
        const user = this.users.get(roomId)?.user

        if (user) { user.filter(user => user.id == userId) }
    }
    getUser(roomId : string , userId : string):User|null{
        if (this.users.get(roomId)) {
            return this.users.get(roomId)?.user.find(user => user.id == userId) || null
        }
        return null
    }
    broadcastMessage(roomId : string, userId : string, userMessage : OutgoingMessage){
        const user = this.getUser(roomId , userId)
        if (!user) {
            console.error("user not found")
            return;
        }
        const users = this.users.get(roomId)
        if (!users) {
            console.error("Room not found")
            return
        }
        const message = {
            type : userMessage.type,
            payload : {
                roomId : roomId , 
                message : userMessage.payload.message,
                name : user.name,
                upvotes : userMessage.payload.upvotes
            }
        }
        users.user.forEach(({websocket}) => {
            websocket.sendUTF(JSON.stringify(message))
        })
    }
}