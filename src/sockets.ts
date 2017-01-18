import {MessageHandler} from "./messageHandler";
import {Message} from "./messages";
import {Socket} from "net";
import {CommMedium} from "./commMedium";
/**
 * Created by flo on 19/12/2016.
 */
var io = require('socket.io')

export class SocketManager extends CommMedium{
    private socketIp            : string
    private socketPort          : number
    private socket              : any
    private connectedActors     : Map<string,Socket>
    private disconnectedActors  : Array<string>
    private pendingMessages     : Map<string,Array<Message>>
    private messageHandler      : MessageHandler

    constructor(ip : string,socketPort : number){
        super()
        this.socketIp           = ip
        this.socketPort         = socketPort
        this.socket             = io(socketPort)
        this.connectedActors    = new Map()
        this.disconnectedActors = []
        this.pendingMessages    = new Map()
    }

    init(messageHandler : MessageHandler){
        this.messageHandler = messageHandler
        var that            = this
        this.socket.on('connection',(client) => {
            client.on('message',(data) => {
                that.messageHandler.dispatch(data)
            })
            client.on('close',() => {
                //TODO
            })
        })
    }

    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId : string,actorAddress : string,actorPort : number){
        var that = this
        var connection = require('socket.io-client')('http://'+actorAddress+":"+actorPort)
        that.disconnectedActors.push(actorId)
        that.pendingMessages.set(actorId,[])
        connection.on('connect',() => {
            that.connectedActors.set(actorId,connection)
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
        else if(this.connectedActors.has(actorId)){
            var sock = this.connectedActors.get(actorId)
            sock.emit('message',msg)
        }
        else{
           throw new Error("Unable to send message to unknown actor")
        }
    }

    hasConnection(actorId : string) : boolean{
        return (this.disconnectedActors.indexOf(actorId) != -1) || this.connectedActors.has(actorId)
    }

    closeAll(){
        this.socket.close()
        this.connectedActors.forEach((sock : any) => {
            sock.close()
        })
    }
}