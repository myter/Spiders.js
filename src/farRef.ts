import {ServerSocketManager} from "./sockets";
import {PromisePool, PromiseAllocation} from "./PromisePool";
import {FieldAccessMessage, MethodInvocationMessage, Message, RouteMessage} from "./messages";
import {serialise} from "./serialisation";
import {ObjectPool} from "./objectPool";
import {CommMedium} from "./commMedium";
/**
 * Created by flo on 21/12/2016.
 */


export abstract class FarReference {
    static farRefAccessorKey        = "_FAR_REF_"
    static proxyWrapperAccessorKey  = "_PROXY_WRAPPER_"
    static ServerProxyTypeKey       = "SPIDER_SERVER_TYPE"
    static ClientProxyTypeKey       = "SPIDER_CLIENT_TYPE"
    ownerId     : string
    objectId    : number
    promisePool : PromisePool
    objectPool  : ObjectPool
    holderRef   : FarReference
    commMedium  : CommMedium
    isServer    : boolean

    constructor(objectId : number,ownerId : string,holderRef : FarReference,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool,isServer : boolean){
        this.ownerId        = ownerId
        this.objectId       = objectId
        this.promisePool    = promisePool
        this.objectPool     = objectPool
        this.holderRef      = holderRef
        this.commMedium     = commMedium
        this.isServer       = isServer
    }
    sendFieldAccess(fieldName : string) : Promise<any>{
        var promiseAlloc : PromiseAllocation = this.promisePool.newPromise()
        this.commMedium.sendMessage(this.ownerId,new FieldAccessMessage(this.holderRef,this.objectId,fieldName,promiseAlloc.promiseId))
        return promiseAlloc.promise
    }

    sendMethodInvocation(methodName : string, args : Array<any>) : Promise<any> {
        var promiseAlloc : PromiseAllocation = this.promisePool.newPromise()
        this.commMedium.sendMessage(this.ownerId,new MethodInvocationMessage(this.holderRef,this.objectId,methodName,args,promiseAlloc.promiseId))
        return promiseAlloc.promise
    }

    proxyify() : Object{
        var baseObject = this
        return new Proxy({},{
            get: function(target,property){
                //Ugly but needed to acquire the proxied far reference
                if(property == FarReference.farRefAccessorKey){
                    return baseObject
                }
                //Similarly, needed to check whether an object is a proxy to a far reference in serialisation (i.e. a far ref is being passed around between actors)
                else if(property == FarReference.ClientProxyTypeKey){
                    return !(baseObject.isServer)
                }
                else if(property == FarReference.ServerProxyTypeKey){
                    return baseObject.isServer
                }
                //ES6 proxies don't allow to catch method invocation on objects. To solve this a far reference returns a "callable" promise as the return of a "get"
                else {
                    //Given that a proxified far reference is actually also a promise we need to make sure that JS does not accidentally pipeline the far reference in a chain of promises
                    if(property.toString() != "then" && property.toString() != "catch"){
                        //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                        var prom = baseObject.sendFieldAccess(property.toString())
                        var ret = function(... args){
                            var serialisedArgs = args.map((arg) => {
                                return serialise(arg,baseObject.holderRef,baseObject.ownerId,baseObject.commMedium,baseObject.promisePool,baseObject.objectPool)
                            })
                            return baseObject.sendMethodInvocation(property.toString(),serialisedArgs)
                        }
                        ret["then"] = function(onFull,onRej){
                            return prom.then(onFull,onRej)
                        }
                        ret["catch"] = function(onRej){
                            return prom.catch(onRej)
                        }
                        ret[FarReference.proxyWrapperAccessorKey] = true
                        return ret
                    }
                }
            }
        })
    }
}

export class ClientFarReference extends FarReference {
    mainId          : string
    contactId       : string
    contactAddress  : string
    contactPort     : number

    constructor(objectId : number,ownerId : string,mainId : string,holderRef : FarReference,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool,contactId : string = null,contactAddress : string = null,contactPort : number = null){
        super(objectId,ownerId,holderRef,commMedium,promisePool,objectPool,false)
        this.mainId         = mainId
        this.contactId      = contactId
        this.contactAddress = contactAddress
        this.contactPort    = contactPort
    }

    private sendRoute(toId : string,msg : Message){
        if(!this.commMedium.hasConnection(this.contactId)){
            this.commMedium.openConnection(this.contactId,this.contactAddress,this.contactPort)
        }
        //TODO quick fix, need to refactor to make sure that message contains the correct contact info (needed to produce return values)
        msg.contactId = this.contactId
        msg.contactAddress = this.contactAddress
        msg.contactPort = this.contactPort
        this.commMedium.sendMessage(this.contactId,new RouteMessage(this,this.ownerId,msg))
    }

    private send(toId : string,msg : Message){
        if(this.holderRef instanceof ServerFarReference){
            if(this.holderRef.ownerId == this.contactId){
                this.commMedium.sendMessage(toId,msg)
            }
            else{
                this.sendRoute(this.contactId,msg)
            }
        }
        else{
            if((this.holderRef as ClientFarReference).mainId == this.mainId){
                this.commMedium.sendMessage(this.ownerId,msg)
            }
            else{
                this.sendRoute(this.contactId,msg)
            }
        }
    }

    sendFieldAccess(fieldName : string) : Promise<any>{
        var promiseAlloc : PromiseAllocation = this.promisePool.newPromise()
        var message = new FieldAccessMessage(this.holderRef,this.objectId,fieldName,promiseAlloc.promiseId)
        this.send(this.ownerId,message)
        return promiseAlloc.promise
    }

    sendMethodInvocation(methodName : string, args : Array<any>) : Promise<any> {
        var promiseAlloc : PromiseAllocation = this.promisePool.newPromise()
        var message = new MethodInvocationMessage(this.holderRef,this.objectId,methodName,args,promiseAlloc.promiseId)
        this.send(this.ownerId,message)
        return promiseAlloc.promise
    }
}

export class ServerFarReference extends FarReference {
    ownerAddress : string
    ownerPort    : number

    constructor(objectId : number,ownerId : string,ownerAddress : string,ownerPort : number,holderRef : FarReference,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool){
        super(objectId,ownerId,holderRef,commMedium,promisePool,objectPool,true)
        this.ownerAddress   = ownerAddress
        this.ownerPort      = ownerPort
    }
}
