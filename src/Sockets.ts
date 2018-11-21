import {MessageHandler} from "./messageHandler";
import {_ROUTE_, Message, RouteMessage} from "./Message";
import {Socket} from "net";
import {CommMedium} from "./CommMedium";
import {ActorEnvironment} from "./ActorEnvironment";
import {ServerFarReference} from "./FarRef";
import {ObjectPool} from "./ObjectPool";
/**
 * Created by flo on 19/12/2016.
 */


//Tracks messages sent to a specific actor
class MessageBuffer{
    //Maps clock times onto messages
    clock     : number
    msgs      : Array<{clockTime : number,msg : Message}>
    maxSize   : number

    constructor(){
        this.clock      = 0
        this.msgs       = []
        //TODO make this configurable
        this.maxSize    = 1000
    }

    addMessage(msg : Message){
        this.msgs.push({clockTime : this.clock,msg : msg})
        msg.setClockTime(this.clock)
        this.clock += 1
        if(this.msgs.length > this.maxSize){
            this.msgs.splice(0,1)
        }
    }

    getMessageFrom(msgClockTime : number){
        return this.msgs.filter((element : {clockTime : number,msg : Message})=>{
            return element.clockTime > msgClockTime
        }).map((el : {clockTime : number,msg : Message})=>{
            return el.msg
        })
    }

    getAllMessages(){
        return this.msgs.map((bufferedMsg : {clockTime : number,msg : Message})=>{
            return bufferedMsg.msg
        })
    }

    getLastSent(){
        return this.clock
    }
}


export class SocketHandler{
    lastProcessed       : Map<string,number>
    sockets             : Map<string,Socket>
    connections         : Array<Socket>
    trying              : Map<string,any>
    msgs                : Map<string,MessageBuffer>
    environment         : ActorEnvironment
    messageHandler      : MessageHandler
    thisActorId         : string

    constructor(thisActorId : string,environment : ActorEnvironment){
        this.lastProcessed      = new Map()
        this.sockets            = new Map()
        this.msgs               = new Map()
        this.environment        = environment
        this.messageHandler     = environment.messageHandler
        this.thisActorId        = thisActorId
        this.connections        = []
        this.trying             = new Map()
    }

    isKnown(id){
        return this.sockets.has(id) || this.trying.has(id)
    }

    handleMessage(fromClient : boolean,data : Message,ports : ReadonlyArray<MessagePort> = [],clientSocket : Socket = null){
        let senderId = data.senderId
        let handle = ()=>{
            this.lastProcessed.set(senderId,data.clockTime)
            if(fromClient){
                this.messageHandler.dispatch(data,ports,clientSocket)
            }
            else{
                this.messageHandler.dispatch(data)
            }
        }
        if(this.lastProcessed.has(senderId)){
            if(this.lastProcessed.get(senderId) < data.clockTime){
                handle()
            }
        }
        else{
            handle()
        }
    }

    handleConnection(actorId : string,connection : Socket){
        if(this.trying.has(actorId)){
            this.trying.delete(actorId)
        }
        this.sockets.set(actorId,connection)
        if(this.msgs.has(actorId)){
            this.msgs.get(actorId).getAllMessages().forEach((msg : Message)=>{
                connection.emit('message',msg)
            })
        }
    }

    handleReconnect(actorId : string,connection : Socket){
        connection.emit('sync',this.lastProcessed.get(actorId))
    }

    handleSync(actorId : string,connection : Socket,lastProcessedClock : number){
        if(this.msgs.has(actorId)){
            let buffer = this.msgs.get(actorId)
            if(buffer.getLastSent() > lastProcessedClock){
                buffer.getMessageFrom(lastProcessedClock).forEach((msg : Message)=>{
                    connection.emit('message',msg)
                })
            }
        }
    }

    openIncomingConnection(socketPort){
        let io          = require('socket.io')
        let connection  = io(socketPort)
        connection.on('connection',(clientSocket)=>{
            let handshakePerformed = false
            let clientActorId
            clientSocket.on('handshake',(clientActorId)=>{
                handshakePerformed  = true
                clientActorId       = clientActorId
                this.handleConnection(clientActorId,clientSocket)
                //Connections opened using openVirginConnection require a serverId back
                clientSocket.emit('serverId',this.environment.thisRef.ownerId)
            })
            clientSocket.on('message',(data)=>{
                this.handleMessage(true,data,[],clientSocket)
            })
            clientSocket.on('reconnect',()=>{
                if(handshakePerformed){
                    this.handleReconnect(clientActorId,connection)
                }
            })
            clientSocket.on('sync',(lastProcessedClock : number)=>{
                if(handshakePerformed){
                    this.handleSync(clientActorId,connection,lastProcessedClock)
                }
            })
            clientSocket.on('discover',(clientActorId)=>{
                handshakePerformed = true
                clientActorId      = clientActorId
                this.handleConnection(clientActorId,clientSocket)
                clientSocket.emit('serverId',this.environment.thisRef.ownerId)
            })
        })
        this.connections.push(connection)
    }

    //Open connection to Node.js instance without knowing actor or object to connect to
    openVirginConnection(address : string,port : number){
        let promisePool     = this.environment.promisePool
        let promiseAlloc    = promisePool.newPromise()
        var connection      = require('socket.io-client')('http://'+address+":"+port)
        this.connections.push(connection)
        let actorId
        connection.on('connect',() => {
            connection.emit('handshake',this.thisActorId)
        })
        connection.on('message',(data)=>{
            this.handleMessage(false,data)
        })
        connection.on('reconnect',()=>{
            this.handleReconnect(actorId,connection)
        })
        connection.on('sync',(lastProcessedClock : number)=>{
            this.handleSync(actorId,connection,lastProcessedClock)
        })
        connection.on('serverId',(serverActorId)=>{
            actorId     = serverActorId
            this.handleConnection(serverActorId,connection)
            let farRef  = new ServerFarReference(ObjectPool._BEH_OBJ_ID,[],[],serverActorId,address,port,this.environment)
            promisePool.resolvePromise(promiseAlloc.promiseId,farRef.proxify())
        })
        return promiseAlloc.promise
    }

    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnectionTo(actorId : string,actorAddress : string,actorPort : number){
        let promisePool     = this.environment.promisePool
        let promiseAlloc    = promisePool.newPromise()
        if(!this.isKnown(actorId)){
            this.trying.set(actorId,true)
            var connection      = require('socket.io-client')('http://'+actorAddress+":"+actorPort)
            this.connections.push(connection)
            connection.on('connect',() => {
                connection.emit('handshake',this.thisActorId)
                this.handleConnection(actorId,connection)
                let farRef = new ServerFarReference(ObjectPool._BEH_OBJ_ID,[],[],actorId,actorAddress,actorPort,this.environment)
                promisePool.resolvePromise(promiseAlloc.promiseId,farRef.proxify())
            })
            connection.on('message',(data)=>{
                this.handleMessage(false,data)
            })
            connection.on('reconnect',()=>{
                this.handleReconnect(actorId,connection)
            })
            connection.on('sync',(lastProcessedClock : number)=>{
                this.handleSync(actorId,connection,lastProcessedClock)
            })
        }
        else{
            let farRef = new ServerFarReference(ObjectPool._BEH_OBJ_ID,[],[],actorId,actorAddress,actorPort,this.environment)
            promisePool.resolvePromise(promiseAlloc.promiseId,farRef.proxify())
        }
        return promiseAlloc.promise
    }

    sendMessage(actorId : string,msg : Message) : void{
        if(!this.msgs.has(actorId)){
            this.msgs.set(actorId,new MessageBuffer())
        }
        this.msgs.get(actorId).addMessage(msg)
        if(this.sockets.has(actorId)){
            this.sockets.get(actorId).emit('message',msg)
        }
    }

    routeMessage(targetId : string,routeId : string,msg : RouteMessage){
        if(!this.msgs.has(targetId)){
            this.msgs.set(targetId,new MessageBuffer())
        }
        msg.message.clockTime = this.msgs.get(targetId).clock
        this.msgs.get(targetId).clock += 1
        this.sendMessage(routeId,msg)
    }
}


export class ServerSocketManager extends CommMedium{

    constructor(ip : string,socketPort : number,environment : ActorEnvironment){
        super(environment)
        this.socketHandler.openIncomingConnection(socketPort)
    }

    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId : string,actorAddress : string,actorPort : number){
        this.socketHandler.openConnectionTo(actorId,actorAddress,actorPort)
    }

    sendMessage(actorId : string,msg : Message) : void{
        this.socketHandler.sendMessage(actorId,msg)
    }

    sendRouteMessage(targetId : string,routeId : string,msg : RouteMessage){
        this.socketHandler.routeMessage(targetId,routeId,msg)
    }

    hasConnection(actorId : string) : boolean{
        return this.socketHandler.isKnown(actorId)
    }

    closeAll(){
        this.socketHandler.connections.forEach((connection)=>{
            (connection as any).close()
        })
    }
}