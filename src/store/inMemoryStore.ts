import { Chat, ChatId, RoomId, Store, UserId } from "./Store";

export interface Room{
    roomId: RoomId;
    chats : Chat[];
}


let globalChatId = 0 
export class inMemoryStore implements Store {
    private store : Map<RoomId , Room>;
    constructor() {
        this.store =new  Map<RoomId , Room>();
    }
    initRoom(roomId:RoomId){
        if (this.store.get(roomId)) {
            return ;
        }
        this.store.set(roomId , {roomId , chats: []})
    }
    getChats(roomId : RoomId , limit : number , offset : number){
        const room  = this.store.get(roomId)
        if (!room) {
            return []
        }
        return room.chats.reverse().slice(offset).slice(-1 * limit)
    }
    addChat(roomId : RoomId, userId : UserId , name : string , message : string):Chat|null{
        const room = this.store.get(roomId)
        if (!this.store.get(roomId)) {
            return null
        }
        const chat = {
            id  : (globalChatId++).toString(),
            userId , 
            name, 
            message,
            upvotes :  []
        }
        room?.chats.push(chat)
        return chat
    }
    upVote(roomId :RoomId , chatId : ChatId, userId : UserId):Chat | null{
        const room  = this.store.get(roomId)

        //number of chats  = 1000, 2000
        if (!room) {
            return null; 
        }
        const chat = room.chats.find((res) => res.id === chatId)
        if (chat) {
            if (chat.upvotes.find(x=> x=== userId)) {
                return chat;
            }
            chat.upvotes.push(userId)
        }
        return chat || null;
    }
    
}