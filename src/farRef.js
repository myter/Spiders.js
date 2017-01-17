const messages_1 = require("./messages");
const serialisation_1 = require("./serialisation");
/**
 * Created by flo on 21/12/2016.
 */
class FarReference {
}
exports.FarReference = FarReference;
class ServerFarReference extends FarReference {
    constructor(objectId, ownerAddress, ownerPort, ownerId, holderRef, socketManager, promisePool, objectPool) {
        super();
        this.objectId = objectId;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
        this.ownerId = ownerId;
        this.holderRef = holderRef;
        this.socketManager = socketManager;
        this.promisePool = promisePool;
        this.objectPool = objectPool;
    }
    sendFieldAccess(fieldName) {
        var promiseAlloc = this.promisePool.newPromise();
        this.socketManager.sendMessage(this.ownerId, new messages_1.FieldAccessMessage(this.holderRef.ownerId, this.holderRef.ownerAddress, this.holderRef.ownerPort, this.objectId, fieldName, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    }
    sendMethodInvocation(methodName, args) {
        var promiseAlloc = this.promisePool.newPromise();
        this.socketManager.sendMessage(this.ownerId, new messages_1.MethodInvocationMessage(this.holderRef.ownerId, this.holderRef.ownerAddress, this.holderRef.ownerPort, this.objectId, methodName, args, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    }
    proxyify() {
        var baseObject = this;
        return new Proxy({}, {
            get: function (target, property) {
                //Ugly but needed to acquire the proxied far reference
                if (property == ServerFarReference.farRefAccessorKey) {
                    return baseObject;
                }
                else if (property == ServerFarReference.proxyTypeAccessorKey) {
                    return true;
                }
                else {
                    //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                    var prom = baseObject.sendFieldAccess(property.toString());
                    var ret = function (...args) {
                        var serialisedArgs = args.map((arg) => {
                            return serialisation_1.serialise(arg, baseObject, baseObject.ownerId, baseObject.socketManager, baseObject.promisePool, baseObject.objectPool);
                        });
                        return baseObject.sendMethodInvocation(property.toString(), serialisedArgs);
                    };
                    ret["then"] = function (onFull, onRej) {
                        return prom.then(onFull, onRej);
                    };
                    ret["catch"] = function (onRej) {
                        return prom.catch(onRej);
                    };
                    ret[ServerFarReference.proxyWrapperAccessorKey] = true;
                    return ret;
                }
            }
        });
    }
}
ServerFarReference.farRefAccessorKey = "_FAR_REF_";
ServerFarReference.proxyTypeAccessorKey = "_SPIDER_TYPE_";
ServerFarReference.proxyWrapperAccessorKey = "_PROXY_WRAPPER_";
exports.ServerFarReference = ServerFarReference;
//# sourceMappingURL=farRef.js.map