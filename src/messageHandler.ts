import {
    ActorCreatedMessage, Message, _ACTOR_CREATED_, _FIELD_ACCESS_, FieldAccessMessage,
    ResolvePromiseMessage, _RESOLVE_PROMISE_, _METHOD_INVOC_, MethodInvocationMessage, _REJECT_PROMISE_,
    RejectPromiseMessage
} from "./messages";
import {SocketManager} from "./sockets";
import {PromisePool} from "./PromisePool";
import {ObjectPool} from "./objectPool";
import {ValueContainer, serialise, deserialise} from "./serialisation";
import {ServerFarReference} from "./farRef";
/**
 * Created by flo on 20/12/2016.
 */
var utils       = require('./utils')

export class MessageHandler{
    private socketManager   : SocketManager
    private promisePool     : PromisePool
    private objectPool      : ObjectPool
    private thisRef         : ServerFarReference

    constructor(thisRef : ServerFarReference,socketManager : SocketManager,promisePool : PromisePool,objectPool : ObjectPool){
        this.socketManager  = socketManager
        this.promisePool    = promisePool
        this.objectPool     = objectPool
        this.thisRef        = thisRef
    }

    private sendReturn(actorId : string,actorAddress : string,actorPort : number,msg : Message){
        if(!(this.socketManager.hasConnection(actorId))){
            this.socketManager.openConnection(actorId,actorAddress,actorPort)
        }
        this.socketManager.sendMessage(actorId,msg)
    }

    //TODO this is probably not needed anymore (at least for server side)
    private handleActorCreated(msg : ActorCreatedMessage){
        if(utils.isBrowser()){
            //TODO
        }
        else{
            //this.socketManager.openConnection(msg.actorAddress,msg.actorPort,msg.actorId,)
        }
    }

    private handleFieldAccess(msg : FieldAccessMessage){
        var targetObject    = this.objectPool.getObject(msg.objectId)
        var fieldVal        = Reflect.get(targetObject,msg.fieldName)
        //Due to JS' crappy meta API actor might receive field access as part of a method invocation (see farRef implementation)
        if(typeof fieldVal != 'function'){
            var serialised = serialise(fieldVal,this.thisRef,msg.senderId,this.socketManager,this.promisePool,this.objectPool)
            this.sendReturn(msg.senderId,msg.senderAddress,msg.senderPort,new ResolvePromiseMessage(this.thisRef.ownerId,this.thisRef.ownerAddress,this.thisRef.ownerPort,msg.promiseId,serialised))
        }
    }

    private handleMethodInvocation(msg : MethodInvocationMessage){
        var targetObject                        = this.objectPool.getObject(msg.objectId)
        var methodName                          = msg.methodName
        var args                                = msg.args
        var deserialisedArgs                    = args.map((arg) => {
            return deserialise(this.thisRef,arg,this.promisePool,this.socketManager,this.objectPool)
        })
        var retVal
        try{
            retVal = targetObject[methodName].apply(targetObject,deserialisedArgs)
            var serialised : ValueContainer         = serialise(retVal,this.thisRef,msg.senderId,this.socketManager,this.promisePool,this.objectPool)
            this.sendReturn(msg.senderId,msg.senderAddress,msg.senderPort,new ResolvePromiseMessage(this.thisRef.ownerId,this.thisRef.ownerAddress,this.thisRef.ownerPort,msg.promiseId,serialised))
        }
        catch(reason){
            var serialised : ValueContainer         = serialise(reason,this.thisRef,msg.senderId,this.socketManager,this.promisePool,this.objectPool)
            this.sendReturn(msg.senderId,msg.senderAddress,msg.senderPort,new RejectPromiseMessage(this.thisRef.ownerId,this.thisRef.ownerAddress,this.thisRef.ownerPort,msg.promiseId,serialised))
        }

    }

    private handlePromiseResolve(msg : ResolvePromiseMessage){
        var deSerialised = deserialise(this.thisRef,msg.value,this.promisePool,this.socketManager,this.objectPool)
        if(msg.foreign){
            this.promisePool.resolveForeignPromise(msg.promiseId,msg.senderId,deSerialised)
        }
        else{
            this.promisePool.resolvePromise(msg.promiseId,deSerialised)
        }
    }

    private handlePromiseReject(msg : RejectPromiseMessage){
        var deSerialised  = deserialise(this.thisRef,msg.reason,this.promisePool,this.socketManager,this.objectPool)
        if(msg.foreign){
            this.promisePool.rejectForeignPromise(msg.promiseId,msg.senderId,deSerialised)
        }
        else{
            this.promisePool.rejectPromise(msg.promiseId,deSerialised)
        }
    }

    dispatch(msg : Message) : void {
        switch(msg.typeTag){
            case _ACTOR_CREATED_:
                this.handleActorCreated(msg as ActorCreatedMessage)
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
            default:
                throw "Unknown message in actor : " + msg.toString()
        }
    }
}