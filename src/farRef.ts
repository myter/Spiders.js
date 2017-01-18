import {SocketManager} from "./sockets";
import {PromisePool, PromiseAllocation} from "./PromisePool";
import {FieldAccessMessage, MethodInvocationMessage, Message} from "./messages";
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

    constructor(objectId : number,ownerId : string,holderRef : FarReference,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool){
        this.ownerId        = ownerId
        this.objectId       = objectId
        this.promisePool    = promisePool
        this.objectPool     = objectPool
        this.holderRef      = holderRef
        this.commMedium     = commMedium
    }
    abstract sendFieldAccess(fieldName : string) : Promise<any>
    abstract sendMethodInvocation(methodName : string,args : Array<any>) : Promise<any>
    abstract proxyify() : Object
}

export class ClientFarReference extends FarReference {

    sendFieldAccess(fieldName : string) : Promise<any>{
        //TODO
        return null
    }

    sendMethodInvocation(methodName : string,args : Array<any>) : Promise<any>{
        //TODO
        return null
    }

    proxyify() : Object{
        //TODO
        return null
    }
}

export class ServerFarReference extends FarReference {
    ownerAddress : string
    ownerPort    : number

    constructor(objectId : number,ownerId : string,ownerAddress : string,ownerPort : number,holderRef : FarReference,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool){
        super(objectId,ownerId,holderRef,commMedium,promisePool,objectPool)
        this.ownerAddress   = ownerAddress
        this.ownerPort      = ownerPort
    }

    sendFieldAccess(fieldName : string) : Promise<any> {
        var promiseAlloc : PromiseAllocation = this.promisePool.newPromise()
        this.commMedium.sendMessage(this.ownerId,new FieldAccessMessage(this.holderRef,this.objectId,fieldName,promiseAlloc.promiseId))
        return promiseAlloc.promise
    }

    sendMethodInvocation(methodName : string, args : Array<any>) : Promise<any> {
        var promiseAlloc : PromiseAllocation = this.promisePool.newPromise()
        this.commMedium.sendMessage(this.ownerId,new MethodInvocationMessage(this.holderRef,this.objectId,methodName,args,promiseAlloc.promiseId))
        return promiseAlloc.promise
    }

    proxyify() : Object {
        var baseObject = this
        return new Proxy({},{
            get: function(target,property){
                //Ugly but needed to acquire the proxied far reference
                if(property == FarReference.farRefAccessorKey){
                    return baseObject
                }
                //Similarly, needed to check whether an object is a proxy to a far reference in serialisation (i.e. a far ref is being passed around between actors)
                else if(property == FarReference.ClientProxyTypeKey){
                    return false
                }
                else if(property == FarReference.ServerProxyTypeKey){
                    return true
                }
                //ES6 proxies don't allow to catch method invocation on objects. To solve this a far reference returns a "callable" promise as the return of a "get"
                else {
                    //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                    var prom = baseObject.sendFieldAccess(property.toString())
                    var ret = function(... args){
                        var serialisedArgs = args.map((arg) => {
                            return serialise(arg,baseObject,baseObject.ownerId,baseObject.commMedium,baseObject.promisePool,baseObject.objectPool)
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
        })
    }
}
