Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 21/12/2016.
 */
class FarReference {
    constructor(objectId, objectFields, objectMethods, ownerId, environment, isServer) {
        this.ownerId = ownerId;
        this.objectFields = objectFields;
        this.objectMethods = objectMethods;
        this.objectId = objectId;
        this.environemnt = environment;
        this.isServer = isServer;
    }
    sendFieldAccess(fieldName) {
        return this.environemnt.actorMirror.sendAccess(this.proxify(), fieldName);
    }
    sendMethodInvocation(methodName, args) {
        return this.environemnt.actorMirror.sendInvocation(this.proxify(), methodName, args);
    }
    stringify() {
        return "<FAR REFERENCE T0 : {" + this.objectFields + "," + this.objectMethods + "}>";
    }
    proxify() {
        var baseObject = this;
        let t = {};
        //Overwrite way far references are printed to console (in node.js)
        if (this.isServer) {
            t.__proto__.inspect = function (depth, opts) {
                return baseObject.stringify();
            };
        }
        return new Proxy(t, {
            get: function (target, property) {
                //If the property is a symbol this is a native call (for example as part of console.log)
                if (typeof property != "string") {
                    return baseObject[property];
                }
                else if (property == "toString") {
                    return () => {
                        return baseObject.stringify();
                    };
                }
                //Ugly but needed to acquire the proxied far reference
                else if (property == FarReference.farRefAccessorKey) {
                    return baseObject;
                }
                //Similarly, needed to check whether an object is a proxy to a far reference in serialisation (i.e. a far ref is being passed around between actors)
                else if (property == FarReference.ClientProxyTypeKey) {
                    return !(baseObject.isServer);
                }
                else if (property == FarReference.ServerProxyTypeKey) {
                    return baseObject.isServer;
                }
                //ES6 proxies don't allow to catch method invocation on objects. To solve this a far reference returns a "callable" promise as the return of a "get"
                else {
                    if (baseObject.objectFields.includes(property.toString())) {
                        return baseObject.sendFieldAccess(property.toString());
                    }
                    else if (baseObject.objectMethods.includes(property.toString())) {
                        var ret = function (...args) {
                            return baseObject.sendMethodInvocation(property.toString(), args);
                        };
                        ret[FarReference.proxyWrapperAccessorKey] = true;
                        return ret;
                    }
                    else {
                        //Given that a proxified far reference is actually also a promise we need to make sure that JS does not accidentally pipeline the far reference in a chain of promises
                        if (property.toString() != "then" && property.toString() != "catch") {
                            //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                            var prom = baseObject.sendFieldAccess(property.toString());
                            var ret = function (...args) {
                                return baseObject.sendMethodInvocation(property.toString(), args);
                            };
                            ret["then"] = function (onFull, onRej) {
                                return prom.then(onFull, onRej);
                            };
                            ret["catch"] = function (onRej) {
                                return prom.catch(onRej);
                            };
                            ret[FarReference.proxyWrapperAccessorKey] = true;
                            return ret;
                        }
                    }
                }
            }
        });
    }
}
FarReference.farRefAccessorKey = "_FAR_REF_";
FarReference.proxyWrapperAccessorKey = "_PROXY_WRAPPER_";
FarReference.ServerProxyTypeKey = "SPIDER_SERVER_TYPE";
FarReference.ClientProxyTypeKey = "SPIDER_CLIENT_TYPE";
exports.FarReference = FarReference;
class ClientFarReference extends FarReference {
    constructor(objectId, objectFields, objectMethods, ownerId, mainId, environment, contactId = null, contactAddress = null, contactPort = null) {
        super(objectId, objectFields, objectMethods, ownerId, environment, false);
        this.mainId = mainId;
        this.contactId = contactId;
        this.contactAddress = contactAddress;
        this.contactPort = contactPort;
    }
    sendFieldAccess(fieldName) {
        return this.environemnt.actorMirror.sendAccess(this.proxify(), fieldName, this.contactId, this.contactAddress, this.contactPort, this.mainId);
    }
    sendMethodInvocation(methodName, args) {
        return this.environemnt.actorMirror.sendInvocation(this.proxify(), methodName, args, this.contactId, this.contactAddress, this.contactPort, this.mainId);
    }
}
exports.ClientFarReference = ClientFarReference;
class ServerFarReference extends FarReference {
    constructor(objectId, objectFields, objectMethods, ownerId, ownerAddress, ownerPort, environment) {
        super(objectId, objectFields, objectMethods, ownerId, environment, true);
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
}
exports.ServerFarReference = ServerFarReference;
//# sourceMappingURL=FarRef.js.map