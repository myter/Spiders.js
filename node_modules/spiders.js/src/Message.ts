/**
 * Created by flo on 20/12/2016.
 */
import {serialise, ValueContainer} from "./serialisation";
import {FarReference, ServerFarReference, ClientFarReference} from "./FarRef";
import {ObjectPool} from "./ObjectPool";
type MessageTypeTag = number


export class Message{
    static serverSenderType = "_SERVER_"
    static clientSenderType = "_CLIENT_"
    typeTag         : MessageTypeTag
    senderId        : string
    senderType      : string
    senderRef       : FarReference
    //For Messages sent by server
    senderAddress   : string
    senderPort      : number
    //For messages sent by client
    senderMainId    : string
    contactId       : string
    contactAddress  : string
    contactPort     : number

    constructor(typeTag : MessageTypeTag,senderRef : FarReference){
        this.typeTag        = typeTag
        this.senderId       = senderRef.ownerId
        this.senderRef      = serialise(senderRef.environemnt.objectPool.getObject(ObjectPool._BEH_OBJ_ID),senderRef.ownerId,senderRef.environemnt) as any
        if(senderRef instanceof ServerFarReference){
            this.senderType     = Message.serverSenderType
            this.senderAddress  = (senderRef as ServerFarReference).ownerAddress
            this.senderPort     = (senderRef as ServerFarReference).ownerPort
        }
        else{
            var clientRef       = senderRef as ClientFarReference
            this.senderType     = Message.clientSenderType
            this.senderMainId   = clientRef.mainId
            this.contactId      = clientRef.contactId
            this.contactAddress = clientRef.contactAddress
            this.contactPort    = clientRef.contactPort
        }
    }
}

export const _INSTALL_BEHAVIOUR_ : MessageTypeTag = 0
export class InstallBehaviourMessage extends Message{
    mainId              : string
    actorId             : string
    vars                : Array<any>
    methods             : Array<any>
    methAnnots          : Array<any>
    mirrorVars          : Array<any>
    mirrorMethods       : Array<any>
    mirrorMethAnnots    : Array<any>
    staticProperties    : Array<any>
    otherActorIds       : Array<string>

    constructor(senderRef : FarReference,mainId : string,actorId : string,vars : Array<any>,methods : Array<any>,methAnnots : Array<any>,mirrorVars : Array<any>,mirrorMethods : Array<any>,mirrorMethAnnots : Array<any>,staticProperties : Array<any>,otherActorIds : Array<string>){
        super(_INSTALL_BEHAVIOUR_,senderRef)
        this.mainId             = mainId
        this.actorId            = actorId
        this.vars               = vars
        this.methods            = methods
        this.methAnnots         = methAnnots
        this.mirrorVars         = mirrorVars
        this.mirrorMethods      = mirrorMethods
        this.mirrorMethAnnots   = mirrorMethAnnots
        this.staticProperties   = staticProperties
        this.otherActorIds      = otherActorIds
    }
}

export const _FIELD_ACCESS_ : MessageTypeTag = 1
export class FieldAccessMessage extends Message{
    objectId    : number
    fieldName   : string
    promiseId   : number
    constructor(senderRef : FarReference,objectId : number,fieldName : string,promiseId : number){
        super(_FIELD_ACCESS_,senderRef)
        this.objectId   = objectId
        this.fieldName = fieldName
        this.promiseId = promiseId
    }
}

export const _METHOD_INVOC_ : MessageTypeTag = 2
export class MethodInvocationMessage extends Message{
    objectId    : number
    methodName  : string
    args        : Array<any>
    promiseId   : number
    constructor(senderRef : FarReference,objectId : number,methodName : string,args : Array<any>,promiseId : number){
        super(_METHOD_INVOC_,senderRef)
        this.objectId   = objectId
        this.methodName = methodName
        this.args       = args
        this.promiseId  = promiseId
    }
}

export const _RESOLVE_PROMISE_ : MessageTypeTag = 3
export class ResolvePromiseMessage extends Message{
    promiseId           : number
    value               : ValueContainer
    foreign             : boolean
    constructor(senderRef : FarReference,promiseId : number,value : ValueContainer,foreign : boolean = false){
        super(_RESOLVE_PROMISE_,senderRef)
        this.promiseId  = promiseId
        this.value      = value
        this.foreign    = foreign
    }
}

export const _REJECT_PROMISE_ : MessageTypeTag = 4
export class RejectPromiseMessage extends Message {
    promiseId   : number
    reason      : ValueContainer
    foreign     : boolean
    constructor(senderRef : FarReference,promiseId : number,reason : ValueContainer,foreign : boolean = false){
        super(_REJECT_PROMISE_,senderRef)
        this.promiseId  = promiseId
        this.reason     = reason
        this.foreign    = foreign
    }
}

export const _OPEN_PORT_ : MessageTypeTag = 5
export class OpenPortMessage extends Message {
    actorId : string
    constructor(senderRef : FarReference,actorId : string){
        super(_OPEN_PORT_,senderRef)
        this.actorId = actorId
    }
}

export const _CONNECT_REMOTE_ : MessageTypeTag = 6
export class ConnectRemoteMessage extends Message{
    promiseId       : number
    connectionId    : number
    constructor(senderRef : FarReference,promiseId : number,connectionId : number){
        super(_CONNECT_REMOTE_,senderRef)
        this.promiseId      = promiseId
        this.connectionId   = connectionId
    }
}

export const _RESOLVE_CONNECTION_ : MessageTypeTag = 7
export class ResolveConnectionMessage extends Message{
    promiseId       : number
    connectionId    : number
    constructor(senderRef : FarReference,promiseId : number,connectionId : number){
        super(_RESOLVE_CONNECTION_,senderRef)
        this.promiseId      = promiseId
        this.connectionId   = connectionId
    }
}

export const _ROUTE_ : MessageTypeTag = 8
export class RouteMessage extends Message {
    targetId    : string
    message     : Message
    constructor(senderRef : FarReference,targetId : string,message : Message){
        super(_ROUTE_,senderRef)
        this.message    = message
        this.targetId   = targetId
    }
}

//TODO address and port will be removed once communication refactor is done
export const _GSP_REGISTER_ : MessageTypeTag = 9
export class GSPRegisterMessage extends Message {
    holderId        : string
    holderAddress   : string
    holderPort      : number
    replicaId       : string
    roundNr         : number
    constructor(senderRef : FarReference,holderId : string,replicaId : string,holderAddress : string,holderPort : number,roundNr : number){
        super(_GSP_REGISTER_,senderRef)
        this.holderId       = holderId
        this.replicaId      = replicaId
        this.holderAddress  = holderAddress
        this.holderPort     = holderPort
        this.roundNr        = roundNr
    }
}

export const _GSP_ROUND_ : MessageTypeTag = 10
export class GSPRoundMessage extends Message {
    round
    senderId : string
    constructor(senderRef : FarReference,round){
        super(_GSP_ROUND_,senderRef)
        this.round      = round
        this.senderId   = senderRef.ownerId
    }
}

export const _GSP_SYNC_ : MessageTypeTag = 11
export class GSPSyncMessage extends Message{
    requesterId : string
    repliqId    : string
    constructor(senderRef : FarReference,requesterId : string,repliqId : string){
        super(_GSP_SYNC_,senderRef)
        this.requesterId    = requesterId
        this.repliqId       = repliqId
    }
}

export const _REGISTER_EXTERNAL_SIGNAL_ : MessageTypeTag = 12
export class RegisterExternalSignalMessage extends Message{
    requesterId         : string
    signalId            : string
    requesterAddress    : string
    requesterPort       : number

    constructor(senderRef : FarReference,requesterId,signalId,requesterAddress,requesterPort){
        super(_REGISTER_EXTERNAL_SIGNAL_,senderRef)
        this.requesterId        = requesterId
        this.signalId           = signalId
        this.requesterAddress   = requesterAddress
        this.requesterPort      = requesterPort
    }
}

export const _EXTERNAL_SIGNAL_CHANGE_ : MessageTypeTag = 13
export class ExternalSignalChangeMessage extends  Message{
    signalId    : string
    newVal      : any

    constructor(senderRef : FarReference,signalId,newVal){
        super(_EXTERNAL_SIGNAL_CHANGE_,senderRef)
        this.signalId   = signalId
        this.newVal     = newVal
    }
}

export const _EXTERNAL_SIGNAL_DELETE_ : MessageTypeTag = 14
export class ExternalSignalDeleteMessage extends Message{
    signalId : string
    constructor(senderRef,signalId){
        super(_EXTERNAL_SIGNAL_DELETE_,senderRef)
        this.signalId = signalId
    }
}


