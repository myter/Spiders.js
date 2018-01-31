import {CommMedium} from "./CommMedium";
import {Message} from "./Message";
import {ActorEnvironment} from "./ActorEnvironment";
/**
 * Created by flo on 18/01/2017.
 */
export class ChannelManager extends CommMedium{
    private connections     : Map<string,MessagePort>

    constructor(environment : ActorEnvironment){
        super(environment)
        this.connections = new Map()
    }

    newConnection(actorId : string,channelPort : MessagePort){
        this.connections.set(actorId,channelPort)
        channelPort.onmessage = (ev : MessageEvent) => {
            this.messageHandler.dispatch(JSON.parse(ev.data),ev.ports)
        }
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

    sendMessage(actorId : string,message : Message,first = true){
        if(this.connections.has(actorId)){
            this.connections.get(actorId).postMessage(JSON.stringify(message))
        }
        else if(this.connectedActors.has(actorId) || this.socketHandler.disconnectedActors.indexOf(actorId) != -1){
            this.socketHandler.sendMessage(actorId,message)
        }
        else{
            //Dirty, but it could be that an actor sends a message to the application actor, leading it to spawn a new actor and returning this new reference.
            //Upon receiving this reference the spawning actor immediatly invokes a method on the reference, but hasn't received the open ports message
            if(first){
                var that = this
                setTimeout(()=>{
                    that.sendMessage(actorId,message,false)
                },10)
            }
            else{
                throw new Error("Unable to send message to unknown actor (channel manager): " + actorId + " in : " + this.messageHandler.environment.thisRef.ownerId)
            }
        }
    }
}