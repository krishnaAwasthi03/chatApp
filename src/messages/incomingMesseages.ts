import z from "zod"

export enum MessageType {
    Join_Room  = "JOIN_ROOM",
    Send_Message = "SEND_MESSAGE",
    Upvote_Message = "UPVOTE_MESSAGE"
}

export type IncomingMessage = {
    type : MessageType.Join_Room,
    payload : InitMessageType
} | {
    type : MessageType.Send_Message,
    payload : UserMessageType
} | {
    type : MessageType.Upvote_Message,
    payload : UpVoteMessageType
}



const InitMessageType = z.object({
    name : z.string(),
    userId : z.string(),
    roomId : z.string()
})

export type InitMessageType = z.infer<typeof InitMessageType>

const UpVoteMessageType = z.object({
    userId : z.string(),
    roomId : z.string(),
    chatId : z.string()
})

export type UpVoteMessageType = z.infer<typeof UpVoteMessageType>

const UserMessageType = z.object({
    userId : z.string(),
    roomId : z.string(),
    message : z.string()
})

export type UserMessageType = z.infer<typeof UserMessageType>