import {
    Message, _FIELD_ACCESS_, FieldAccessMessage,
    ResolvePromiseMessage, _RESOLVE_PROMISE_, _METHOD_INVOC_, MethodInvocationMessage, _REJECT_PROMISE_,
    RejectPromiseMessage, _INSTALL_BEHAVIOUR_, InstallBehaviourMessage, _OPEN_PORT_, OpenPortMessage, _CONNECT_REMOTE_,
    ConnectRemoteMessage, ResolveConnectionMessage, _RESOLVE_CONNECTION_, RouteMessage, _ROUTE_
} from "./messages";
import {ServerSocketManager} from "./sockets";
import {PromisePool} from "./PromisePool";
import {ObjectPool} from "./objectPool";
import {ValueContainer, serialise, deserialise, reconstructObject} from "./serialisation";
import {ServerFarReference, FarReference, ClientFarReference} from "./farRef";
import {CommMedium} from "./commMedium";
import {ChannelManager} from "./ChannelManager";
import {Socket} from "net";
/**
 * Created by flo on 20/12/2016.
 */
var utils       = require('./utils')

export class MessageHandler{
    private commMedium      : CommMedium
    private promisePool     : PromisePool
    private objectPool      : ObjectPool
    thisRef         : FarReference

    constructor(thisRef : FarReference,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool){
        this.commMedium     = commMedium
        this.promisePool    = promisePool
        this.objectPool     = objectPool
        this.thisRef        = thisRef
    }

    private sendReturnServer(actorId : string,actorAddress : string,actorPort : number,msg : Message){
        if(!(this.commMedium.hasConnection(actorId))){
            this.commMedium.openConnection(actorId,actorAddress,actorPort)
        }
        this.commMedium.sendMessage(actorId,msg)
    }

    private sendReturnClient(actorId : string,originalMsg : Message,returnMsg : Message){
        if(this.thisRef instanceof ClientFarReference){
            //Message to which actor is replying came from a different client host, send routing message to contact server actor
            if((this.thisRef as ClientFarReference).mainId != originalMsg.senderMainId){
                this.sendReturnServer(originalMsg.contactId,originalMsg.contactAddress,originalMsg.contactPort,new RouteMessage(this.thisRef,actorId,returnMsg))
            }
            else{
                this.commMedium.sendMessage(actorId,returnMsg)
            }
        }
        else{
            this.commMedium.sendMessage(actorId,returnMsg)
        }
    }

    //Only received as first message by a web worker (i.e. newly spawned client side actor)
    private handleInstall(msg : InstallBehaviourMessage,ports : Array<MessagePort>){
        var thisId                  = msg.actorId
        var mainId                  = msg.mainId
        var thisRef                 = new ClientFarReference(ObjectPool._BEH_OBJ_ID,thisId,mainId,null,this.commMedium,this.promisePool,this.objectPool)
        var behaviourObject         = reconstructObject({},msg.vars,msg.methods,thisRef,this.promisePool,this.commMedium,this.objectPool)
        var otherActorIds           = msg.otherActorIds
        this.objectPool.installBehaviourObject(behaviourObject)
        this.thisRef                = thisRef
        var parentRef               = new ClientFarReference(ObjectPool._BEH_OBJ_ID,mainId,mainId,this.thisRef,this.commMedium,this.promisePool,this.objectPool)
        var channelManag            = this.commMedium as ChannelManager
        var mainPort                = ports[0]
        channelManag.newConnection(mainId,mainPort)
        otherActorIds.forEach((id,index)=>{
            //Ports at position 0 contains main channel (i.e. channel used to communicate with application actor)
            channelManag.newConnection(id,ports[index + 1])
        })
        utils.installSTDLib(thisRef,parentRef,behaviourObject,this,channelManag,this.promisePool)
    }

    private handleOpenPort(msg : OpenPortMessage,port : MessagePort){
        var channelManager = (this.commMedium as ChannelManager)
        channelManager.newConnection(msg.actorId,port)
    }

    private handleFieldAccess(msg : FieldAccessMessage){
        var targetObject    = this.objectPool.getObject(msg.objectId)
        var fieldVal        = Reflect.get(targetObject,msg.fieldName)
        //Due to JS' crappy meta API actor might receive field access as part of a method invocation (see farRef implementation)
        if(typeof fieldVal != 'function'){
            var serialised  = serialise(fieldVal,this.thisRef,msg.senderId,this.commMedium,this.promisePool,this.objectPool)
            var message     = new ResolvePromiseMessage(this.thisRef,msg.promiseId,serialised)
            if(msg.senderType == Message.serverSenderType){
                this.sendReturnServer(msg.senderId,msg.senderAddress,msg.senderPort,message)
            }
            else{
                this.sendReturnClient(msg.senderId,msg,message)
            }
        }
    }

    private handleMethodInvocation(msg : MethodInvocationMessage){
        var targetObject                        = this.objectPool.getObject(msg.objectId)
        var methodName                          = msg.methodName
        var args                                = msg.args
        var deserialisedArgs                    = args.map((arg) => {
            return deserialise(this.thisRef,arg,this.promisePool,this.commMedium,this.objectPool)
        })
        var retVal
        try{
            //retVal = targetObject[methodName].apply(targetObject,deserialisedArgs)
            retVal = targetObject[methodName](...deserialisedArgs)
            var serialised : ValueContainer         = serialise(retVal,this.thisRef,msg.senderId,this.commMedium,this.promisePool,this.objectPool)
            var message    : Message                = new ResolvePromiseMessage(this.thisRef,msg.promiseId,serialised)
            if(msg.senderType == Message.serverSenderType){
                this.sendReturnServer(msg.senderId,msg.senderAddress,msg.senderPort,message)
            }
            else{
                this.sendReturnClient(msg.senderId,msg,message)
            }
        }
        catch(reason){
            var serialised : ValueContainer         = serialise(reason,this.thisRef,msg.senderId,this.commMedium,this.promisePool,this.objectPool)
            message                             = new RejectPromiseMessage(this.thisRef,msg.promiseId,serialised)
            if(msg.senderType == Message.serverSenderType){
                this.sendReturnServer(msg.senderId,msg.senderAddress,msg.senderPort,message)
            }
            else{
                this.sendReturnClient(msg.senderId,msg,message)
            }
        }

    }

    private handlePromiseResolve(msg : ResolvePromiseMessage){
        var deSerialised = deserialise(this.thisRef,msg.value,this.promisePool,this.commMedium,this.objectPool)
        if(msg.foreign){
            this.promisePool.resolveForeignPromise(msg.promiseId,msg.senderId,deSerialised)
        }
        else{
            this.promisePool.resolvePromise(msg.promiseId,deSerialised)
        }
    }

    private handlePromiseReject(msg : RejectPromiseMessage){
        var deSerialised  = deserialise(this.thisRef,msg.reason,this.promisePool,this.commMedium,this.objectPool)
        if(msg.foreign){
            this.promisePool.rejectForeignPromise(msg.promiseId,msg.senderId,deSerialised)
        }
        else{
            this.promisePool.rejectPromise(msg.promiseId,deSerialised)
        }
    }

    //Can only be received by a server actor
    private handleConnectRemote(msg : ConnectRemoteMessage,clientSocket : Socket){
        var resolveMessage = new ResolveConnectionMessage(this.thisRef,msg.promiseId,msg.connectionId)
        if(msg.senderType == Message.serverSenderType){
            this.sendReturnServer(msg.senderId,msg.senderAddress,msg.senderPort,resolveMessage)
        }
        else{
            var socketManager = this.commMedium as ServerSocketManager
            socketManager.addNewClient(msg.senderId,clientSocket)
            this.sendReturnClient(msg.senderId,msg,resolveMessage)
        }
    }

    private handleResolveConnection(msg : ResolveConnectionMessage){
        this.commMedium.resolvePendingConnection(msg.senderId,msg.connectionId)
        var farRef = new ServerFarReference(ObjectPool._BEH_OBJ_ID,msg.senderId,msg.senderAddress,msg.senderPort,this.thisRef,this.commMedium,this.promisePool,this.objectPool)
        this.promisePool.resolvePromise(msg.promiseId,farRef.proxyify())
    }

    private handleRoute(msg : RouteMessage){
        this.commMedium.sendMessage(msg.targetId,msg.message)
    }

    //Ports are needed for client side actor communication and cannot be serialised together with message objects (is always empty for server-side code)
    //Client socket is provided by server-side implementation and is used whenever a client connects remotely to a server actor
    dispatch(msg : Message,ports : Array<MessagePort> = [],clientSocket : Socket = null) : void {
        switch(msg.typeTag){
            case _INSTALL_BEHAVIOUR_:
                this.handleInstall(msg as InstallBehaviourMessage,ports)
                break
            case _OPEN_PORT_:
                this.handleOpenPort(msg as OpenPortMessage,ports[0])
                break
            case _FIELD_ACCESS_:
                this.handleFieldAccess(msg as FieldAccessMessage)
                break
            case _METHOD_INVOC_:
                this.handleMethodInvocation(msg as MethodInvocationMessage)
                break
            case _RESOLVE_PROMISE_:
                this.handlePromiseResolve(msg as ResolvePromiseMessage)
                break
            case _REJECT_PROMISE_:
                this.handlePromiseReject(msg as RejectPromiseMessage)
                break
            case _CONNECT_REMOTE_:
                this.handleConnectRemote(msg as ConnectRemoteMessage,clientSocket)
                break
            case _RESOLVE_CONNECTION_:
                this.handleResolveConnection(msg as ResolveConnectionMessage)
                break
            case _ROUTE_:
                this.handleRoute(msg as RouteMessage)
                break
            default:
                throw "Unknown message in actor : " + msg.toString()
        }
    }
}