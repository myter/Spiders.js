import {SocketManager} from "./sockets";
import {PromisePool, PromiseAllocation} from "./PromisePool";
import {FieldAccessMessage, MethodInvocationMessage} from "./messages";
import {serialise} from "./serialisation";
import {ObjectPool} from "./objectPool";
/**
 * Created by flo on 21/12/2016.
 */


export abstract class FarReference {
    abstract sendFieldAccess(fieldName : string) : Promise<any>
    abstract sendMethodInvocation(methodName : string,args : Array<any>) : Promise<any>
    abstract proxyify() : Object
}

export class ServerFarReference extends FarReference {
    ownerAddress    : string
    ownerPort       : number
    ownerId         : string
    holderRef       : ServerFarReference
    socketManager   : SocketManager
    promisePool     : PromisePool
    objectPool      : ObjectPool
    objectId        : number
    static farRefAccessorKey        = "_FAR_REF_"
    static proxyTypeAccessorKey     = "_SPIDER_TYPE_"
    static proxyWrapperAccessorKey  = "_PROXY_WRAPPER_"

    constructor(objectId : number,ownerAddress : string, ownerPort : number, ownerId : string,holderRef : ServerFarReference, socketManager : SocketManager, promisePool : PromisePool,objectPool : ObjectPool){
        super()
        this.objectId       = objectId
        this.ownerAddress   = ownerAddress
        this.ownerPort      = ownerPort
        this.ownerId        = ownerId
        this.holderRef      = holderRef
        this.socketManager  = socketManager
        this.promisePool    = promisePool
        this.objectPool     = objectPool
    }

    sendFieldAccess(fieldName : string) : Promise<any> {
        var promiseAlloc : PromiseAllocation = this.promisePool.newPromise()
        this.socketManager.sendMessage(this.ownerId,new FieldAccessMessage(this.holderRef.ownerId,this.holderRef.ownerAddress,this.holderRef.ownerPort,this.objectId,fieldName,promiseAlloc.promiseId))
        return promiseAlloc.promise
    }

    sendMethodInvocation(methodName : string, args : Array<any>) : Promise<any> {
        var promiseAlloc : PromiseAllocation = this.promisePool.newPromise()
        this.socketManager.sendMessage(this.ownerId,new MethodInvocationMessage(this.holderRef.ownerId,this.holderRef.ownerAddress,this.holderRef.ownerPort,this.objectId,methodName,args,promiseAlloc.promiseId))
        return promiseAlloc.promise
    }

    proxyify() : Object {
        var baseObject = this
        return new Proxy({},{
            get: function(target,property){
                //Ugly but needed to acquire the proxied far reference
                if(property == ServerFarReference.farRefAccessorKey){
                    return baseObject
                }
                //Similarly, needed to check whether an object is a proxy to a far reference in serialisation (i.e. a far ref is being passed around between actors)
                else if(property == ServerFarReference.proxyTypeAccessorKey){
                    return true
                }
                //ES6 proxies don't allow to catch method invocation on objects. To solve this a far reference returns a "callable" promise as the return of a "get"
                else {
                    //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                    var prom = baseObject.sendFieldAccess(property.toString())
                    var ret = function(... args){
                        var serialisedArgs = args.map((arg) => {
                            return serialise(arg,baseObject,baseObject.ownerId,baseObject.socketManager,baseObject.promisePool,baseObject.objectPool)
                        })
                        return baseObject.sendMethodInvocation(property.toString(),serialisedArgs)
                    }
                    ret["then"] = function(onFull,onRej){
                        return prom.then(onFull,onRej)
                    }
                    ret["catch"] = function(onRej){
                        return prom.catch(onRej)
                    }
                    ret[ServerFarReference.proxyWrapperAccessorKey] = true
                    return ret
                }
            }
        })
    }
}
