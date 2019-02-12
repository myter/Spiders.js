import {
    Message, _FIELD_ACCESS_, FieldAccessMessage,
    ResolvePromiseMessage, _RESOLVE_PROMISE_, _METHOD_INVOC_, MethodInvocationMessage, _REJECT_PROMISE_,
    RejectPromiseMessage, _INSTALL_BEHAVIOUR_, InstallBehaviourMessage, _OPEN_PORT_, OpenPortMessage,
     RouteMessage, _ROUTE_
} from "./Message";
import {ObjectPool} from "./ObjectPool";
import {
    ValueContainer, serialise, deserialise, ClientFarRefContainer,
    reconstructBehaviour, reconstructStatic
} from "./serialisation";
import {ServerFarReference, ClientFarReference, FarReference} from "./FarRef";
import {ChannelManager} from "./ChannelManager";
import {Socket} from "net";
import {ActorEnvironment, ClientActorEnvironment} from "./ActorEnvironment";
import {ActorSTDLib} from "./ActorSTDLib";
/**
 * Created by flo on 20/12/2016.
 */

export class MessageHandler{
    environment : ActorEnvironment

    constructor(environment : ActorEnvironment){
        this.environment = environment
    }

    private sendReturnServer(actorId : string,actorAddress : string,actorPort : number,msg : Message,routing : boolean = false){
        let commMedium = this.environment.commMedium
        if(!(commMedium.hasConnection(actorId))){
            commMedium.openConnection(actorId,actorAddress,actorPort)
        }
        if(routing){
            commMedium.sendRouteMessage((msg as RouteMessage).targetId,actorId,msg as RouteMessage)
        }
        else{
            commMedium.sendMessage(actorId,msg)
        }
    }

    private sendReturnClient(actorId : string,originalMsg : Message,returnMsg : Message){
        let thisRef     = this.environment.thisRef
        let commMedium  = this.environment.commMedium
        if(thisRef instanceof ClientFarReference){
            //Message to which actor is replying came from a different client host, send routing message to contact server actor
            if((thisRef as ClientFarReference).mainId != originalMsg.senderMainId){
                this.sendReturnServer(originalMsg.contactId,originalMsg.contactAddress,originalMsg.contactPort,new RouteMessage(this.environment.thisRef,actorId,returnMsg),true)
            }
            else{
                commMedium.sendMessage(actorId,returnMsg)
            }
        }
        else{
            commMedium.sendMessage(actorId,returnMsg)
        }
    }

    //Only received as first message by a web worker (i.e. newly spawned client side actor)
    private handleInstall(msg : InstallBehaviourMessage,ports : ReadonlyArray<MessagePort>){
        var thisId                      = msg.actorId
        var mainId                      = msg.mainId;
        var behaviourObject             = reconstructBehaviour({},msg.vars,msg.methods,msg.methAnnots,this.environment)
        var actorMirror                 = reconstructBehaviour({},msg.mirrorVars,msg.mirrorMethods,msg.mirrorMethAnnots,this.environment)
        actorMirror.bindBase(this.environment,serialise)
        this.environment.actorMirror    = actorMirror
        reconstructStatic(behaviourObject,msg.staticProperties,this.environment);
        (this.environment as ClientActorEnvironment).initialise(thisId,mainId,behaviourObject)
        var otherActorIds               = msg.otherActorIds
        var parentRef                   = new ClientFarReference(ObjectPool._BEH_OBJ_ID,msg.senderRef[FarReference.farRefAccessorKey].objectFields,msg.senderRef[FarReference.farRefAccessorKey].objectMethods,mainId,mainId,this.environment)
        let channelManag                = this.environment.commMedium as ChannelManager
        var mainPort                = ports[0]
        channelManag.newConnection(mainId,mainPort)
        otherActorIds.forEach((id,index)=>{
            //Ports at position 0 contains main channel (i.e. channel used to communicate with application actor)
            channelManag.newConnection(id,ports[index + 1])
        })
        let stdLib                      = new ActorSTDLib(this.environment)
        this.environment.actorMirror.initialise(stdLib,false,parentRef)
    }

    private handleOpenPort(msg : OpenPortMessage,port : MessagePort){
        var channelManager = (this.environment.commMedium as ChannelManager)
        channelManager.newConnection(msg.actorId,port)
    }

    private handleFieldAccess(msg : FieldAccessMessage){
        var targetObject    = this.environment.objectPool.getObject(msg.objectId)
        this.environment.actorMirror.receiveAccess((msg.senderRef as any),targetObject,msg.fieldName,()=>{
            var fieldVal        = Reflect.get(targetObject,msg.fieldName)
            //Due to JS' crappy meta API actor might receive field access as part of a method invocation (see farRef implementation)
            if(typeof fieldVal != 'function'){
                var serialised  = serialise(fieldVal,msg.senderId,this.environment)
                var message     = new ResolvePromiseMessage(this.environment.thisRef,msg.promiseId,serialised)
                if(msg.senderType == Message.serverSenderType){
                    this.sendReturnServer(msg.senderId,msg.senderAddress,msg.senderPort,message)
                }
                else{
                    this.sendReturnClient(msg.senderId,msg,message)
                }
            }
            return undefined
        })
    }

    private handleMethodInvocation(msg: MethodInvocationMessage) {
        var targetObject = this.environment.objectPool.getObject(msg.objectId)
        var methodName = msg.methodName
        var args = msg.args
        var deserialisedArgs = args.map((arg) => {
            return deserialise(arg, this.environment)
        })
        let performInvocation = ()=>{
            let retVal
            try {
                retVal = targetObject[methodName].apply(targetObject, deserialisedArgs)
            }
            catch (reason) {
                console.log("Went wrong for : " + methodName)
                console.log(reason)
                retVal = reason
            }
            return retVal
        }
        let sendReturn = (returnVal : any)=>{
            let serialised : ValueContainer = serialise(returnVal, msg.senderId, this.environment)
            let message : Message
            if(returnVal instanceof Error){
                message = new RejectPromiseMessage(this.environment.thisRef, msg.promiseId, serialised)
            }
            else{
                message = new ResolvePromiseMessage(this.environment.thisRef, msg.promiseId, serialised)
            }
            if (msg.senderType == Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message)
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message)
            }
        }
        this.environment.actorMirror.receiveInvocation((msg.senderRef as any), targetObject, methodName, deserialisedArgs, performInvocation,sendReturn)
    }

    private handlePromiseResolve(msg : ResolvePromiseMessage){
        let promisePool = this.environment.promisePool
        var deSerialised = deserialise(msg.value,this.environment)
        if(msg.foreign){
            promisePool.resolveForeignPromise(msg.promiseId,msg.senderId,deSerialised)
        }
        else{
            promisePool.resolvePromise(msg.promiseId,deSerialised)
        }
    }

    private handlePromiseReject(msg : RejectPromiseMessage){
        let promisePool = this.environment.promisePool
        var deSerialised  = deserialise(msg.reason,this.environment)
        if(msg.foreign){
            promisePool.rejectForeignPromise(msg.promiseId,msg.senderId,deSerialised)
        }
        else{
            promisePool.rejectPromise(msg.promiseId,deSerialised)
        }
    }

    private handleRoute(msg : RouteMessage){
        //Message has been serialised and has therefore lost its "setClockTime" method (no way around this, at some point need to call JSON.stringify to send message between actors)
        msg.message.setClockTime = (clockTime : number)=>{}
        //Must ensure that any client references "leaking" form this server actor also have the correct contact information
        if((msg.message.senderRef as any).type == ValueContainer.clientFarRefType){
            let container : ClientFarRefContainer = msg.message.senderRef as any
            if(container.contactId == null){
                let thisRef                 = this.environment.thisRef
                container.contactId         = thisRef.ownerId
                container.contactAddress    = (thisRef as ServerFarReference).ownerAddress
                container.contactPort       = (thisRef as ServerFarReference).ownerPort
            }
        }
        if(msg.message.typeTag == _METHOD_INVOC_){
            var args = (msg.message as MethodInvocationMessage).args
            args.forEach((valContainer : ValueContainer)=>{
                if(valContainer.type == ValueContainer.clientFarRefType){
                    var container = valContainer as ClientFarRefContainer
                    if(container.contactId == null){
                        let thisRef                 = this.environment.thisRef
                        container.contactId         = thisRef.ownerId
                        container.contactAddress    = (thisRef as ServerFarReference).ownerAddress
                        container.contactPort       = (thisRef as ServerFarReference).ownerPort
                    }
                }
            })
        }
        if(msg.message.typeTag == _RESOLVE_PROMISE_){
            var value = (msg.message as ResolvePromiseMessage).value
            if(value.type == ValueContainer.clientFarRefType){
                let container               = value as ClientFarRefContainer
                if(container.contactId == null){
                    let thisRef                 = this.environment.thisRef
                    container.contactId         = thisRef.ownerId
                    container.contactAddress    = (thisRef as ServerFarReference).ownerAddress
                    container.contactPort       = (thisRef as ServerFarReference).ownerPort
                }
            }
        }
        this.environment.commMedium.sendMessage(msg.targetId,msg.message)
    }

    //Ports are needed for client side actor communication and cannot be serialised together with message objects (is always empty for server-side code)
    //Client socket is provided by server-side implementation and is used whenever a client connects remotely to a server actor
    dispatch(msg : Message,ports : ReadonlyArray<MessagePort> = [],clientSocket : Socket = null) : void {
        msg.senderRef = deserialise(msg.senderRef as any,this.environment)
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
            case _ROUTE_:
                this.handleRoute(msg as RouteMessage)
                break
            default:
                throw "Unknown message in actor : " + JSON.stringify(msg)
        }
    }
}