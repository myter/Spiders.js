const messages_1 = require("./messages");
const serialisation_1 = require("./serialisation");
/**
 * Created by flo on 21/12/2016.
 */
class FarReference {
    constructor(objectId, ownerId, holderRef, commMedium, promisePool, objectPool, isServer) {
        this.ownerId = ownerId;
        this.objectId = objectId;
        this.promisePool = promisePool;
        this.objectPool = objectPool;
        this.holderRef = holderRef;
        this.commMedium = commMedium;
        this.isServer = isServer;
    }
    proxyify() {
        var baseObject = this;
        return new Proxy({}, {
            get: function (target, property) {
                //Ugly but needed to acquire the proxied far reference
                if (property == FarReference.farRefAccessorKey) {
                    return baseObject;
                }
                else if (property == FarReference.ClientProxyTypeKey) {
                    return !(baseObject.isServer);
                }
                else if (property == FarReference.ServerProxyTypeKey) {
                    return baseObject.isServer;
                }
                else {
                    //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                    var prom = baseObject.sendFieldAccess(property.toString());
                    var ret = function (...args) {
                        var serialisedArgs = args.map((arg) => {
                            return serialisation_1.serialise(arg, baseObject, baseObject.ownerId, baseObject.commMedium, baseObject.promisePool, baseObject.objectPool);
                        });
                        return baseObject.sendMethodInvocation(property.toString(), serialisedArgs);
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
        });
    }
}
FarReference.farRefAccessorKey = "_FAR_REF_";
FarReference.proxyWrapperAccessorKey = "_PROXY_WRAPPER_";
FarReference.ServerProxyTypeKey = "SPIDER_SERVER_TYPE";
FarReference.ClientProxyTypeKey = "SPIDER_CLIENT_TYPE";
exports.FarReference = FarReference;
class ClientFarReference extends FarReference {
    constructor(objectId, ownerId, mainId, holderRef, commMedium, promisePool, objectPool) {
        super(objectId, ownerId, holderRef, commMedium, promisePool, objectPool, false);
        this.mainId = mainId;
    }
    sendFieldAccess(fieldName) {
        //TODO
        return null;
    }
    sendMethodInvocation(methodName, args) {
        //TODO
        return null;
    }
}
exports.ClientFarReference = ClientFarReference;
class ServerFarReference extends FarReference {
    constructor(objectId, ownerId, ownerAddress, ownerPort, holderRef, commMedium, promisePool, objectPool) {
        super(objectId, ownerId, holderRef, commMedium, promisePool, objectPool, true);
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
    sendFieldAccess(fieldName) {
        var promiseAlloc = this.promisePool.newPromise();
        this.commMedium.sendMessage(this.ownerId, new messages_1.FieldAccessMessage(this.holderRef, this.objectId, fieldName, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    }
    sendMethodInvocation(methodName, args) {
        var promiseAlloc = this.promisePool.newPromise();
        this.commMedium.sendMessage(this.ownerId, new messages_1.MethodInvocationMessage(this.holderRef, this.objectId, methodName, args, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    }
}
exports.ServerFarReference = ServerFarReference;
//# sourceMappingURL=farRef.js.map