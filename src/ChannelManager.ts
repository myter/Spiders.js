import {CommMedium} from "./commMedium";
import {MessageHandler} from "./messageHandler";
import {Message} from "./messages";
/**
 * Created by flo on 18/01/2017.
 */
export class ChannelManager extends CommMedium{
    private messageHandler  : MessageHandler
    private connections     : Map<string,MessagePort>

    init(messageHandler : MessageHandler){
        this.messageHandler = messageHandler
        this.connections    = new Map()
    }

    newConnection(actorId : string,channelPort : MessagePort){
        channelPort.onmessage = (ev : MessageEvent) => {
            this.messageHandler.dispatch(JSON.parse(ev.data),ev.ports)
        }
        this.connections.set(actorId,channelPort)
    }

    hasConnection(actorId : string) : boolean{
        return this.connections.has(actorId)
    }

    sendMessage(actorId : string,message : Message){
        if(this.connections.has(actorId)){
            this.connections.get(actorId).postMessage(JSON.stringify(message))
        }
        else{
            throw new Error("Unable to send message to unknown actor")
        }
    }
}