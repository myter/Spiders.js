import {MessageHandler} from "./messageHandler";
import {Message, ConnectRemoteMessage} from "./messages";
import {Socket} from "net";
import {CommMedium} from "./commMedium";
import {FarReference, ServerFarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
import {ObjectPool} from "./objectPool";
/**
 * Created by flo on 19/12/2016.
 */
var io = require('socket.io')

export class SocketHandler{
    disconnectedActors  : Array<string>
    pendingMessages     : Map<string,Array<Message>>
    owner               : CommMedium
    messageHandler      : MessageHandler

    constructor(owner : CommMedium){
        this.owner                  = owner
        this.disconnectedActors     = []
        this.pendingMessages        = new Map()
    }


    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId : string,actorAddress : string,actorPort : number){
        var that = this
        var connection = require('socket.io-client')('http://'+actorAddress+":"+actorPort)
        that.disconnectedActors.push(actorId)
        that.pendingMessages.set(actorId,[])
        connection.on('connect',() => {
            that.owner.connectedActors.set(actorId,connection)
            that.disconnectedActors = that.disconnectedActors.filter((id : string)=>{
                id != actorId
            })
            if(that.pendingMessages.has(actorId)){
                var messages = that.pendingMessages.get(actorId)
                messages.forEach((msg : Message) => {
                    that.sendMessage(actorId,msg)
                })
            }
        })
        connection.on('message',function(data){
            that.messageHandler.dispatch(data)
        })
        connection.on('disconnect',function(){
            that.disconnectedActors.push(actorId)
        })
    }

    sendMessage(actorId : string,msg : Message) : void{
        if(this.disconnectedActors.indexOf(actorId) != -1){
            var msgs = this.pendingMessages.get(actorId)
            msgs.push(msg)
            this.pendingMessages.set(actorId,msgs)
        }
        else if(this.owner.connectedActors.has(actorId)){
            var sock = this.owner.connectedActors.get(actorId)
            sock.emit('message',msg)
        }
        else{
            throw new Error("Unable to send message to unknown actor")
        }
    }
}

export class ServerSocketManager extends CommMedium{
    private socketIp            : string
    private socketPort          : number
    private socket              : any
    private socketHandler       : SocketHandler

    constructor(ip : string,socketPort : number){
        super()
        this.socketIp               = ip
        this.socketPort             = socketPort
        this.socket                 = io(socketPort)
        this.socketHandler          = new SocketHandler(this)
    }

    init(messageHandler : MessageHandler){
        this.socketHandler.messageHandler = messageHandler
        this.socket.on('connection',(client) => {
            client.on('message',(data) => {
                messageHandler.dispatch(data)
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

    sendMessage(actorId : string,msg : Message) : void{
        this.socketHandler.sendMessage(actorId,msg)
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