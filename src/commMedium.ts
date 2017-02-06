import {MessageHandler} from "./messageHandler";
import {Message, ConnectRemoteMessage} from "./messages";
import {FarReference, ServerFarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
import {Socket} from "net";
/**
 * Created by flo on 17/01/2017.
 */
export abstract class CommMedium{
    messageHandler
    init(messageHandler : MessageHandler){
        this.messageHandler = messageHandler
    }
    abstract sendMessage(actorId : string,message : Message)
    abstract openConnection(actorId : string,actorAddress : string,actorPort : number)
    abstract hasConnection(actorId : string)


    //Common implementation for both socket as well as channel manager
    pendingActors       : Map<number,Socket>
    connectedActors     : Map<string,Socket>
    pendingConnectionId : number

    constructor(){
        this.pendingActors          = new Map()
        this.connectedActors        = new Map()
        this.pendingConnectionId    = 0
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
        this.connectedActors.set(actorId,connection)
    }
}