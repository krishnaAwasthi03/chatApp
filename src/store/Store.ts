export type UserId = string
export type ChatId= string
export type RoomId = string
export interface Chat{
    id : ChatId,
    userId  : UserId;
    name : string;
    message : string;   
    upvotes : UserId[];
}

export abstract class Store {
    constructor(){

    }
    abstract initRoom(roomId: RoomId):void;
    abstract getChats(roomId : RoomId , limit : number , offset : number):Chat[];
    abstract addChat(roomId : RoomId,   userId : UserId , name : string , message : string): Chat |null;
    abstract upVote(room : RoomId , chatId : ChatId , userId : UserId):Chat|null;

}