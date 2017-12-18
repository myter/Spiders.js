Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
const serialisation_1 = require("./serialisation");
/**
 * Created by flo on 21/12/2016.
 */
class FarReference {
    constructor(objectId, ownerId, environment, isServer) {
        this.ownerId = ownerId;
        this.objectId = objectId;
        this.environemnt = environment;
        this.isServer = isServer;
    }
    sendFieldAccess(fieldName) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        this.environemnt.commMedium.sendMessage(this.ownerId, new Message_1.FieldAccessMessage(this.environemnt.thisRef, this.objectId, fieldName, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    }
    sendMethodInvocation(methodName, args) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        this.environemnt.commMedium.sendMessage(this.ownerId, new Message_1.MethodInvocationMessage(this.environemnt.thisRef, this.objectId, methodName, args, promiseAlloc.promiseId));
        return promiseAlloc.promise;
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
                    //Given that a proxified far reference is actually also a promise we need to make sure that JS does not accidentally pipeline the far reference in a chain of promises
                    if (property.toString() != "then" && property.toString() != "catch") {
                        //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                        var prom = baseObject.sendFieldAccess(property.toString());
                        var ret = function (...args) {
                            var serialisedArgs = args.map((arg) => {
                                return serialisation_1.serialise(arg, baseObject.ownerId, baseObject.environemnt);
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
    constructor(objectId, ownerId, mainId, environment, contactId = null, contactAddress = null, contactPort = null) {
        super(objectId, ownerId, environment, false);
        this.mainId = mainId;
        this.contactId = contactId;
        this.contactAddress = contactAddress;
        this.contactPort = contactPort;
    }
    sendRoute(toId, msg) {
        if (!this.environemnt.commMedium.hasConnection(this.contactId)) {
            this.environemnt.commMedium.openConnection(this.contactId, this.contactAddress, this.contactPort);
        }
        //TODO quick fix, need to refactor to make sure that message contains the correct contact info (needed to produce return values)
        msg.contactId = this.contactId;
        msg.contactAddress = this.contactAddress;
        msg.contactPort = this.contactPort;
        this.environemnt.commMedium.sendMessage(this.contactId, new Message_1.RouteMessage(this, this.ownerId, msg));
    }
    send(toId, msg) {
        let holderRef = this.environemnt.thisRef;
        if (holderRef instanceof ServerFarReference) {
            if (holderRef.ownerId == this.contactId) {
                this.environemnt.commMedium.sendMessage(toId, msg);
            }
            else {
                this.sendRoute(this.contactId, msg);
            }
        }
        else {
            if (holderRef.mainId == this.mainId) {
                this.environemnt.commMedium.sendMessage(this.ownerId, msg);
            }
            else {
                this.sendRoute(this.contactId, msg);
            }
        }
    }
    sendFieldAccess(fieldName) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        var message = new Message_1.FieldAccessMessage(this.environemnt.thisRef, this.objectId, fieldName, promiseAlloc.promiseId);
        this.send(this.ownerId, message);
        return promiseAlloc.promise;
    }
    sendMethodInvocation(methodName, args) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        var message = new Message_1.MethodInvocationMessage(this.environemnt.thisRef, this.objectId, methodName, args, promiseAlloc.promiseId);
        this.send(this.ownerId, message);
        return promiseAlloc.promise;
    }
}
exports.ClientFarReference = ClientFarReference;
class ServerFarReference extends FarReference {
    constructor(objectId, ownerId, ownerAddress, ownerPort, environment) {
        super(objectId, ownerId, environment, true);
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
}
exports.ServerFarReference = ServerFarReference;
//# sourceMappingURL=FarRef.js.map