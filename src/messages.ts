/**
 * Created by flo on 20/12/2016.
 */
import {ValueContainer} from "./serialisation";
import {FarReference, ServerFarReference} from "./farRef";
type MessageTypeTag = number


export class Message{
    static serverSenderType = "_SERVER_"
    static clientSenderType = "_CLIENT_"
    typeTag         : MessageTypeTag
    senderId        : string
    senderType      : string
    senderAddress   : string
    senderPort      : number
    constructor(typeTag : MessageTypeTag,senderRef : FarReference){
        this.typeTag        = typeTag
        this.senderId       = senderRef.ownerId
        if(senderRef instanceof ServerFarReference){
            this.senderType     = Message.serverSenderType
            this.senderAddress  = (senderRef as ServerFarReference).ownerAddress
            this.senderPort     = (senderRef as ServerFarReference).ownerPort
        }
        else{
            this.senderType     = Message.clientSenderType
        }

    }
}

export const _ACTOR_CREATED_ : MessageTypeTag = 0
export class ActorCreatedMessage extends Message{
    actorAddress    : string
    actorPort       : number
    actorId         : string
    constructor(actorAddress : string,actorPort : number,actorId : string){
        super(_ACTOR_CREATED_,null)
        this.actorAddress   = actorAddress
        this.actorPort      = actorPort
        this.actorId        = actorId
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


