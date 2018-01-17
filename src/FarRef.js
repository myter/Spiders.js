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
        return this.environemnt.actorMirror.sendAccess(this, fieldName);
    }
    sendMethodInvocation(methodName, args) {
        return this.environemnt.actorMirror.sendInvocation(this, methodName, args);
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
        return this.environemnt.actorMirror.sendAccess(this, fieldName, this.contactId, this.contactAddress, this.contactPort, this.mainId);
    }
    sendMethodInvocation(methodName, args) {
        return this.environemnt.actorMirror.sendInvocation(this, methodName, args, this.contactId, this.contactAddress, this.contactPort, this.mainId);
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