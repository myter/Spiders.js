import {ActorEnvironment} from "./ActorEnvironment";
const util = require('util');
/**
 * Created by flo on 21/12/2016.
 */

export abstract class FarReference {
    static farRefAccessorKey        = "_FAR_REF_"
    static proxyWrapperAccessorKey  = "_PROXY_WRAPPER_"
    static ServerProxyTypeKey       = "SPIDER_SERVER_TYPE"
    static ClientProxyTypeKey       = "SPIDER_CLIENT_TYPE"
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
        return this.environemnt.actorMirror.sendAccess(this.proxify() as FarReference, fieldName)
    }

    sendMethodInvocation(methodName: string, args: Array<any>): Promise<any> {
        return this.environemnt.actorMirror.sendInvocation(this.proxify() as FarReference, methodName, args)
    }

    stringify(){
        return "<FAR REFERENCE T0 : {" + this.objectFields + "," + this.objectMethods + "}>"
    }

    proxify(): Object {
        var baseObject  = this
        let t           = {};
        //Overwrite way far references are printed to console (in node.js)
        if(this.environemnt.thisRef){
            if(this.environemnt.thisRef.isServer){
                t[util.inspect.custom] = (depth, options) => {
                    return baseObject.stringify();
                };
            }
        }
        return new Proxy({}, {
            get: function (target, property) {
                //If the property is a symbol this is a native call (for example as part of console.log)
                if(typeof property != "string"){
                    return t[property]
                }
                else if (property == "toString"){
                    return ()=>{
                        return baseObject.stringify()
                    }
                }
                //Ugly but needed to acquire the proxied far reference
                else if (property == FarReference.farRefAccessorKey) {
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
                else{
                    if ((baseObject.objectFields as any).includes(property.toString())) {
                        return baseObject.sendFieldAccess(property.toString())
                    }
                    else if ((baseObject.objectMethods as any).includes(property.toString())) {
                        var ret = function (...args) {
                            return baseObject.sendMethodInvocation(property.toString(), args)
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
                                return baseObject.sendMethodInvocation(property.toString(), args)
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

    sendFieldAccess(fieldName: string): Promise<any> {
        return this.environemnt.actorMirror.sendAccess(this.proxify() as FarReference,fieldName,this.contactId,this.contactAddress,this.contactPort,this.mainId)
    }

    sendMethodInvocation(methodName: string, args: Array<any>): Promise<any> {
        return this.environemnt.actorMirror.sendInvocation(this.proxify() as FarReference,methodName,args,this.contactId,this.contactAddress,this.contactPort,this.mainId)
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
