/**
 * Created by flo on 20/12/2016.
 */
import {ValueContainer} from "./serialisation";
type MessageTypeTag = number

export class Message{
    typeTag         : MessageTypeTag
    senderId        : string
    senderAddress   : string
    senderPort      : number
    constructor(typeTag : MessageTypeTag,senderId : string,senderAddress : string,senderPort : number){
        this.typeTag        = typeTag
        this.senderId       = senderId
        this.senderAddress  = senderAddress
        this.senderPort     = senderPort
    }
}

export const _ACTOR_CREATED_ : MessageTypeTag = 0
export class ActorCreatedMessage extends Message{
    actorAddress    : string
    actorPort       : number
    actorId         : string
    constructor(actorAddress : string,actorPort : number,actorId : string){
        super(_ACTOR_CREATED_,actorId,actorAddress,actorPort)
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
    constructor(senderId : string,senderAddress : string,senderPort : number,objectId : number,fieldName : string,promiseId : number){
        super(_FIELD_ACCESS_,senderId,senderAddress,senderPort)
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
    constructor(senderId : string,senderAddress : string,senderPort : number,objectId : number,methodName : string,args : Array<any>,promiseId : number){
        super(_METHOD_INVOC_,senderId,senderAddress,senderPort)
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
    constructor(senderId : string,senderAddress : string,senderPort : number,promiseId : number,value : ValueContainer,foreign : boolean = false){
        super(_RESOLVE_PROMISE_,senderId,senderAddress,senderPort)
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
    constructor(senderId : string,senderAddress : string,senderPort : number,promiseId : number,reason : ValueContainer,foreign : boolean = false){
        super(_REJECT_PROMISE_,senderId,senderAddress,senderPort)
        this.promiseId  = promiseId
        this.reason     = reason
        this.foreign    = foreign
    }
}


