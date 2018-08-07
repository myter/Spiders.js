import {ActorEnvironment} from "./ActorEnvironment";
import {ClientFarReference, FarReference, ServerFarReference} from "./FarRef";
import {PromiseAllocation} from "./PromisePool";
import {
    FieldAccessMessage, Message, MethodInvocationMessage, RouteMessage,
} from "./Message";
import {ActorSTDLib} from "./ActorSTDLib";

export class SpiderActorMirror{
    base : ActorEnvironment
    serialise

    private getInitChain(behaviourObject : any,result : Array<Function>){
        var properties = Reflect.ownKeys(behaviourObject)
        //Have reached base level object, end of prototype chain (ugly but works)
        if(properties.indexOf("init") != -1){
            result.unshift(Reflect.get(behaviourObject,"init"))
        }
        if(properties.indexOf("valueOf") !=-1){
            return result
        }
        else{
            return this.getInitChain(behaviourObject.__proto__,result)
        }
    }

    private sendRoute(toId : string,contactId: string,contactAddress,contactPort, msg: Message) {
        if (!this.base.commMedium.hasConnection(toId)) {
            this.base.commMedium.openConnection(toId, contactAddress, contactPort)
        }
        //TODO quick fix, need to refactor to make sure that message contains the correct contact info (needed to produce return values)
        msg.contactId = toId
        msg.contactAddress = contactAddress
        msg.contactPort = contactPort

        this.base.commMedium.sendMessage(toId, new RouteMessage(this.base.thisRef, toId, msg))
    }

    private send(targetRef : FarReference,toId: string, msg: Message,contactId,contactAddress,contactPort,mainId) {
        let holderRef = this.base.thisRef
        if (holderRef instanceof ServerFarReference) {
            if(targetRef instanceof ServerFarReference){
                this.base.commMedium.sendMessage(toId,msg)
            }
            else if (holderRef.ownerId == contactId) {
                this.base.commMedium.sendMessage(toId, msg)
            }
            else {
                this.sendRoute(toId,contactId,contactAddress,contactPort, msg)
            }
        }
        else {
            if(targetRef instanceof ServerFarReference){
                if(!this.base.commMedium.hasConnection(toId)){
                    this.base.commMedium.openConnection(toId,targetRef.ownerAddress,targetRef.ownerPort)
                }
                this.base.commMedium.sendMessage(toId,msg)
            }
            else if ((holderRef as ClientFarReference).mainId == mainId) {
                this.base.commMedium.sendMessage(toId, msg)
            }
            else {
                this.sendRoute(toId,contactId,contactAddress,contactPort, msg)
            }
        }
    }

    bindBase(base : ActorEnvironment,serialise){
        this.base       = base
        this.serialise  = serialise
    }

    //Only non-app actors have a parent reference
    initialise(actSTDLib : ActorSTDLib,appActor : boolean,parentRef : FarReference = null){
        let behaviourObject = this.base.objectPool.getObject(0)
        if(!appActor){
            behaviourObject["parent"]       = parentRef.proxify()
        }
        behaviourObject["libs"]             = actSTDLib
        if(!appActor){
            var initChain                   = this.getInitChain(behaviourObject,[])
            initChain.forEach((initFunc)=>{
                initFunc.apply(behaviourObject,[])
            })
        }
    }

    receiveInvocation(sender : FarReference,targetObject : Object,methodName : string,args : Array<any>,performInvocation : () => any = () => {return undefined},sendReturn : (returnVal : any) => any = ()=>{return undefined}){
        let retVal = performInvocation()
        sendReturn(retVal)
    }

    receiveAccess(sender : FarReference,targetObject : Object,fieldName : string,performAccess : () => undefined = () => undefined){
        performAccess()
    }

    sendInvocation(target : FarReference,methodName : string,args : Array<any>,contactId = this.base.thisRef.ownerId,contactAddress = null,contactPort = null,mainId = null) : Promise<any>{
        let targetRef                           = target[FarReference.farRefAccessorKey]
        var promiseAlloc : PromiseAllocation    = this.base.promisePool.newPromise()
        let serialisedArgs                      = args.map((arg)=>{
            return this.serialise(arg,targetRef.ownerId,this.base)
        })
        this.send(targetRef,targetRef.ownerId,new MethodInvocationMessage(this.base.thisRef,targetRef.objectId,methodName,serialisedArgs,promiseAlloc.promiseId),contactId,contactAddress,contactPort,mainId)
        return promiseAlloc.promise
    }

    sendAccess(target : FarReference,fieldName : string,contactId = this.base.thisRef.ownerId,contactAddress = null,contactPort = null,mainId = null) : Promise<any>{
        let targetRef                        = target[FarReference.farRefAccessorKey]
        var promiseAlloc : PromiseAllocation = this.base.promisePool.newPromise()
        this.send(targetRef,targetRef.ownerId,new FieldAccessMessage(this.base.thisRef,targetRef.objectId,fieldName,promiseAlloc.promiseId),contactId,contactAddress,contactPort,mainId)
        return promiseAlloc.promise
    }
}