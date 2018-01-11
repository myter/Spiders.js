import {PromisePool, PromiseAllocation} from "./PromisePool";
import {FieldAccessMessage, MethodInvocationMessage, Message, RouteMessage} from "./Message";
import {serialise} from "./serialisation";
import {ObjectPool} from "./ObjectPool";
import {CommMedium} from "./CommMedium";
import {GSP} from "./Replication/GSP";
import {ActorEnvironment} from "./ActorEnvironment";

/**
 * Created by flo on 21/12/2016.
 */

export abstract class FarReference {
    static farRefAccessorKey = "_FAR_REF_"
    static proxyWrapperAccessorKey = "_PROXY_WRAPPER_"
    static ServerProxyTypeKey = "SPIDER_SERVER_TYPE"
    static ClientProxyTypeKey = "SPIDER_CLIENT_TYPE"
    ownerId: string
    objectFields: Array<string>
    objectMethods: Array<string>
    objectId: number
    environemnt: ActorEnvironment
    isServer: boolean

    constructor(objectId: number, objectFields: Array<string>, objectMethods: Array<string>, ownerId: string, environment: ActorEnvironment, isServer: boolean) {
        this.ownerId = ownerId
        this.objectFields = objectFields
        this.objectMethods = objectMethods
        this.objectId = objectId
        this.environemnt = environment
        this.isServer = isServer
    }

    sendFieldAccess(fieldName: string): Promise<any> {
        return this.environemnt.actorMirror.sendAccess(this, fieldName)
    }

    sendMethodInvocation(methodName: string, args: Array<any>): Promise<any> {
        return this.environemnt.actorMirror.sendInvocation(this, methodName, args)
    }

    proxyify(): Object {
        var baseObject = this
        return new Proxy({}, {
            get: function (target, property) {
                //Ugly but needed to acquire the proxied far reference
                if (property == FarReference.farRefAccessorKey) {
                    return baseObject
                }
                //Similarly, needed to check whether an object is a proxy to a far reference in serialisation (i.e. a far ref is being passed around between actors)
                else if (property == FarReference.ClientProxyTypeKey) {
                    return !(baseObject.isServer)
                }
                else if (property == FarReference.ServerProxyTypeKey) {
                    return baseObject.isServer
                }
                //ES6 proxies don't allow to catch method invocation on objects. To solve this a far reference returns a "callable" promise as the return of a "get"
                else {
                    if ((baseObject.objectFields as any).includes(property.toString())) {
                        return baseObject.sendFieldAccess(property.toString())
                    }
                    else if ((baseObject.objectMethods as any).includes(property.toString())) {
                        var ret = function (...args) {
                            var serialisedArgs = args.map((arg) => {
                                return serialise(arg, baseObject.ownerId, baseObject.environemnt)
                            })
                            return baseObject.sendMethodInvocation(property.toString(), serialisedArgs)
                        }
                        ret[FarReference.proxyWrapperAccessorKey] = true
                        return ret
                    }
                    else {
                        //Given that a proxified far reference is actually also a promise we need to make sure that JS does not accidentally pipeline the far reference in a chain of promises
                        if (property.toString() != "then" && property.toString() != "catch") {
                            //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                            var prom = baseObject.sendFieldAccess(property.toString())
                            var ret = function (...args) {
                                var serialisedArgs = args.map((arg) => {
                                    return serialise(arg, baseObject.ownerId, baseObject.environemnt)
                                })
                                return baseObject.sendMethodInvocation(property.toString(), serialisedArgs)
                            }
                            ret["then"] = function (onFull, onRej) {
                                return prom.then(onFull, onRej)
                            }
                            ret["catch"] = function (onRej) {
                                return prom.catch(onRej)
                            }
                            ret[FarReference.proxyWrapperAccessorKey] = true
                            return ret
                        }
                    }

                }
            }
        })
    }
}

export class ClientFarReference extends FarReference {
    mainId: string
    contactId: string
    contactAddress: string
    contactPort: number

    constructor(objectId: number, objectFields: Array<string>, objectMethods: Array<string>, ownerId: string, mainId: string, environment: ActorEnvironment, contactId: string = null, contactAddress: string = null, contactPort: number = null) {
        super(objectId, objectFields, objectMethods, ownerId, environment, false)
        this.mainId = mainId
        this.contactId = contactId
        this.contactAddress = contactAddress
        this.contactPort = contactPort
    }

    private sendRoute(toId: string, msg: Message) {
        if (!this.environemnt.commMedium.hasConnection(this.contactId)) {
            this.environemnt.commMedium.openConnection(this.contactId, this.contactAddress, this.contactPort)
        }
        //TODO quick fix, need to refactor to make sure that message contains the correct contact info (needed to produce return values)
        msg.contactId = this.contactId
        msg.contactAddress = this.contactAddress
        msg.contactPort = this.contactPort

        this.environemnt.commMedium.sendMessage(this.contactId, new RouteMessage(this, this.ownerId, msg))
    }

    private send(toId: string, msg: Message) {
        let holderRef = this.environemnt.thisRef
        if (holderRef instanceof ServerFarReference) {
            if (holderRef.ownerId == this.contactId) {
                this.environemnt.commMedium.sendMessage(toId, msg)
            }
            else {
                this.sendRoute(this.contactId, msg)
            }
        }
        else {
            if ((holderRef as ClientFarReference).mainId == this.mainId) {
                this.environemnt.commMedium.sendMessage(this.ownerId, msg)
            }
            else {
                this.sendRoute(this.contactId, msg)
            }
        }
    }

    sendFieldAccess(fieldName: string): Promise<any> {
        var promiseAlloc: PromiseAllocation = this.environemnt.promisePool.newPromise()
        var message = new FieldAccessMessage(this.environemnt.thisRef, this.objectId, fieldName, promiseAlloc.promiseId)
        this.send(this.ownerId, message)
        return promiseAlloc.promise
    }

    sendMethodInvocation(methodName: string, args: Array<any>): Promise<any> {
        var promiseAlloc: PromiseAllocation = this.environemnt.promisePool.newPromise()
        var message = new MethodInvocationMessage(this.environemnt.thisRef, this.objectId, methodName, args, promiseAlloc.promiseId)
        this.send(this.ownerId, message)
        return promiseAlloc.promise
    }
}

export class ServerFarReference extends FarReference {
    ownerAddress: string
    ownerPort: number

    constructor(objectId: number, objectFields: Array<string>, objectMethods: Array<string>, ownerId: string, ownerAddress: string, ownerPort: number, environment: ActorEnvironment) {
        super(objectId, objectFields, objectMethods, ownerId, environment, true)
        this.ownerAddress = ownerAddress
        this.ownerPort = ownerPort
    }
}
