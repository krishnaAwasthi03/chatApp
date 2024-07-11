import { ChatId } from "../store/Store"


export enum SupportedMessageOutgoing {
    AddChat = "ADD_CHAT",
    UpdateChat = "UPDATE_CHAT"
}

export type messagesType = {
    roomId: string,
    message: string,
    name: string,
    upvotes:number, 
    chatId:ChatId

}

export type OutgoingMessage = {
    type: SupportedMessageOutgoing.AddChat
    payload: messagesType
} | {
        type: SupportedMessageOutgoing.UpdateChat
        payload : Partial<messagesType>
    }