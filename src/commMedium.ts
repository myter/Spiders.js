import {MessageHandler} from "./messageHandler";
import {Message, ConnectRemoteMessage} from "./messages";
import {FarReference, ServerFarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
import {Socket} from "net";
import {SocketHandler} from "./sockets";
/**
 * Created by flo on 17/01/2017.
 */
export abstract class CommMedium{
    abstract sendMessage(actorId : string,message : Message)
    abstract openConnection(actorId : string,actorAddress : string,actorPort : number)
    abstract hasConnection(actorId : string)


    //Common implementation for both socket as well as channel manager
    pendingActors       : Map<number,Socket>
    connectedActors     : Map<string,Socket>
    pendingConnectionId : number
    messageHandler      : MessageHandler
    socketHandler       : SocketHandler

    constructor(){
        this.pendingActors          = new Map()
        this.connectedActors        = new Map()
        this.pendingConnectionId    = 0
        this.socketHandler          = new SocketHandler(this)
    }

    init(messageHandler : MessageHandler){
        this.messageHandler = messageHandler
    }


    //Called whenever a server far reference is passed around between actors.
    //Given that at this point the id of the server is known (in contrast to when "remote" is called, we can simply open up a port to the server and mark the socket as "disconnected" using the actor id
    connectTransientRemote(sender : FarReference,toServerRef : ServerFarReference,promisePool : PromisePool){
        this.connectRemote(sender,toServerRef.ownerAddress,toServerRef.ownerPort,promisePool)
        this.socketHandler.addDisconnected(toServerRef.ownerId)
    }

    connectRemote(sender : FarReference,address : string,port : number,promisePool : PromisePool) : Promise<any>{
        var promiseAllocation       = promisePool.newPromise()
        var connection              = require('socket.io-client')('http://'+address+":"+port)
        var connectionId            = this.pendingConnectionId
        this.pendingActors.set(connectionId,connection)
        this.pendingConnectionId    += 1
        connection.on('connect',() => {
            connection.emit('message',new ConnectRemoteMessage(sender,promiseAllocation.promiseId,connectionId))
        })
        connection.on('message',(data) => {
            if(sender instanceof ServerFarReference){
                this.messageHandler.dispatch(data)
            }
            else{
                this.messageHandler.dispatch(JSON.parse(data))
            }
        })
        return promiseAllocation.promise
    }

    resolvePendingConnection(actorId : string,connectionId : number){
        var connection                  = this.pendingActors.get(connectionId)
        this.socketHandler.removeFromDisconnected(actorId,connection)
        this.connectedActors.set(actorId,connection)
    }
}