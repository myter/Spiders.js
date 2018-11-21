import {Message, RouteMessage} from "./Message";
import {SocketHandler} from "./Sockets";
import {ActorEnvironment} from "./ActorEnvironment";
/**
 * Created by flo on 17/01/2017.
 */

export abstract class CommMedium{
    socketHandler       : SocketHandler
    environment         : ActorEnvironment

    constructor(environment : ActorEnvironment){
        this.environment            = environment
        this.socketHandler          = new SocketHandler(environment.thisRef.ownerId,environment)
    }

    connectRemote(address : string,port : number){
        return this.socketHandler.openVirginConnection(address,port)
    }

    abstract sendMessage(actorId : string,message : Message)
    abstract sendRouteMessage(targetId : string,routerId : string,routeMessage : RouteMessage)
    abstract openConnection(actorId : string,actorAddress : string,actorPort : number)
    abstract hasConnection(actorId : string)
}