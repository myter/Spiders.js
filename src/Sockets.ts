import {MessageHandler} from "./messageHandler";
import {Message} from "./Message";
import {Socket} from "net";
import {CommMedium} from "./CommMedium";
import {ActorEnvironment} from "./ActorEnvironment";
/**
 * Created by flo on 19/12/2016.
 */



export class SocketHandler{
    disconnectedActors  : Array<string>
    pendingMessages     : Map<string,Array<Message>>
    //TODO obviously a temp fix , problem arises in SOR with many actors
    fuckUpMessage       : Map<string,Array<Message>>
    owner               : CommMedium
    messageHandler      : MessageHandler

    constructor(owner : CommMedium){
        this.owner                  = owner
        this.disconnectedActors     = []
        this.pendingMessages        = new Map<string,Array<Message>>()
        this.fuckUpMessage          = new Map<string,Array<Message>>()
    }

    addDisconnected(actorId : string){
        this.disconnectedActors.push(actorId)
        this.pendingMessages.set(actorId,[])
        this.owner.connectedActors.delete(actorId)
    }

    removeFromDisconnected(actorId : string,connection : Socket){
        this.owner.connectedActors.set(actorId,connection)
        this.disconnectedActors = this.disconnectedActors.filter((id : string)=>{
            id != actorId
        })
        if(this.pendingMessages.has(actorId)){
            var messages = this.pendingMessages.get(actorId)
            messages.forEach((msg : Message) => {
                this.sendMessage(actorId,msg)
            })
            this.pendingMessages.delete(actorId)
        }
    }

    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId : string,actorAddress : string,actorPort : number){
        var that = this
        var connection = require('socket.io-client')('http://'+actorAddress+":"+actorPort)
        this.addDisconnected(actorId)
        connection.on('connect',() => {
            that.removeFromDisconnected(actorId,connection)
            //TODO To remove once solution found
            if(that.fuckUpMessage.has(actorId)){
                that.fuckUpMessage.get(actorId).forEach((msg : Message)=>{
                    that.sendMessage(actorId,msg)
                })
            }
        })
        connection.on('message',(data,ack)=>{
            ack()
            that.messageHandler.dispatch(data)
        })
        connection.on('disconnect',function(){
            that.addDisconnected(actorId)
        })
    }

    sendMessage(actorId : string,msg : Message) : void{
        if(this.disconnectedActors.indexOf(actorId) != -1){
            this.pendingMessages.get(actorId).push(msg)
        }
        else if(this.owner.connectedActors.has(actorId)){
            var sock = this.owner.connectedActors.get(actorId)
            let ack  = false
            sock.emit('message',msg,()=>{
                ack = true
            })
            setTimeout(()=>{
                if(!ack){
                    this.sendMessage(actorId,msg)
                }
            },1000)
        }
        else{
            //TODO TEMP
            if(this.fuckUpMessage.has(actorId)){
                this.fuckUpMessage.get(actorId).push(msg)
            }
            else{
                var q = [msg]
                this.fuckUpMessage.set(actorId,q)
            }
            //throw new Error("Unable to send message to unknown actor (socket handler) in " + msg.fieldName + " to : " + actorId + " in : " + this.messageHandler.thisRef.ownerId)
        }
    }
}

export class ServerSocketManager extends CommMedium{
    private socketIp            : string
    private socketPort          : number
    private socket              : any
    private connectedClients    : Map<string,Socket>

    constructor(ip : string,socketPort : number,environment : ActorEnvironment){
        super(environment)
        var io                      = require('socket.io')
        this.socketIp               = ip
        this.socketPort             = socketPort
        this.socket                 = io(socketPort)
        this.connectedClients       = new Map<string,Socket>()
        this.socketHandler.messageHandler = environment.messageHandler
        this.socket.on('connection',(client) => {
            client.on('message',(data,ack)=>{
                ack()
                environment.messageHandler.dispatch(data,[],client)
            })
            client.on('close',() => {
                //TODO
            })
        })
    }

    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId : string,actorAddress : string,actorPort : number){
        this.socketHandler.openConnection(actorId,actorAddress,actorPort)
    }

    addNewClient(actorId : string,socket : Socket){
        this.connectedClients.set(actorId,socket)
    }

    sendMessage(actorId : string,msg : Message) : void{
        if(this.connectedClients.has(actorId)){
            let ack = false
            this.connectedClients.get(actorId).emit('message',JSON.stringify(msg),()=>{
                ack = true
            })
            setTimeout(()=>{
                if(!ack){
                    this.sendMessage(actorId,msg)
                }
            },1000)
        }
        else{
            this.socketHandler.sendMessage(actorId,msg)
        }
    }

    hasConnection(actorId : string) : boolean{
        return (this.socketHandler.disconnectedActors.indexOf(actorId) != -1) || this.connectedActors.has(actorId)
    }

    closeAll(){
        this.socket.close()
        this.connectedActors.forEach((sock : any) => {
            sock.close()
        })
    }
}