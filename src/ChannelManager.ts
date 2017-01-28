import {CommMedium} from "./commMedium";
import {MessageHandler} from "./messageHandler";
import {Message} from "./messages";
import {SocketHandler} from "./sockets";
/**
 * Created by flo on 18/01/2017.
 */
export class ChannelManager extends CommMedium{
    private messageHandler  : MessageHandler
    private connections     : Map<string,MessagePort>
    private socketHandler   : SocketHandler
    private portsOpened     : boolean
    private bufferedMsgs    : Map<string,Array<Message>>

    init(messageHandler : MessageHandler){
        this.messageHandler = messageHandler
        this.connections    = new Map()
        this.socketHandler  = new SocketHandler(this)
        this.portsOpened    = false
        this.bufferedMsgs   = new Map()
    }

    portsInit(){
        this.portsOpened = true
        this.bufferedMsgs.forEach((msgs,receiverId) => {
            msgs.forEach((msg) => {
                this.sendMessage(receiverId,msg)
            })
        })
    }

    newConnection(actorId : string,channelPort : MessagePort){
        channelPort.onmessage = (ev : MessageEvent) => {
            this.messageHandler.dispatch(JSON.parse(ev.data),ev.ports)
        }
        this.connections.set(actorId,channelPort)
    }

    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId : string,actorAddress : string,actorPort : number){
        this.socketHandler.openConnection(actorId,actorAddress,actorPort)
    }

    hasConnection(actorId : string) : boolean{
        var inChannel       = this.connections.has(actorId)
        var connected       = this.connectedActors.has(actorId)
        var disconnected    = this.socketHandler.disconnectedActors.indexOf(actorId) != -1
        return inChannel || connected || disconnected
    }

    sendMessage(actorId : string,message : Message){
        if(!this.portsOpened){
            if(this.bufferedMsgs.has(actorId)){
                this.bufferedMsgs.get(actorId).push(message)
            }
            else{
                this.bufferedMsgs.set(actorId,[message])
            }
        }
        else if(this.connections.has(actorId)){
            this.connections.get(actorId).postMessage(JSON.stringify(message))
        }
        else if(this.connectedActors.has(actorId) || this.socketHandler.disconnectedActors.indexOf(actorId) != -1){
            this.socketHandler.sendMessage(actorId,message)
        }
        else{
            throw new Error("Unable to send message to unknown actor (channel manager)")
        }
    }
}