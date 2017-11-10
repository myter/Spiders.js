"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("./messages");
var serialisation_1 = require("./serialisation");
/**
 * Created by flo on 21/12/2016.
 */
var FarReference = (function () {
    function FarReference(objectId, ownerId, environment, isServer) {
        this.ownerId = ownerId;
        this.objectId = objectId;
        this.environemnt = environment;
        this.isServer = isServer;
    }
    FarReference.prototype.sendFieldAccess = function (fieldName) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        this.environemnt.commMedium.sendMessage(this.ownerId, new messages_1.FieldAccessMessage(this.environemnt.thisRef, this.objectId, fieldName, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    };
    FarReference.prototype.sendMethodInvocation = function (methodName, args) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        this.environemnt.commMedium.sendMessage(this.ownerId, new messages_1.MethodInvocationMessage(this.environemnt.thisRef, this.objectId, methodName, args, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    };
    FarReference.prototype.proxyify = function () {
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
                        var ret = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var serialisedArgs = args.map(function (arg) {
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
    };
    FarReference.farRefAccessorKey = "_FAR_REF_";
    FarReference.proxyWrapperAccessorKey = "_PROXY_WRAPPER_";
    FarReference.ServerProxyTypeKey = "SPIDER_SERVER_TYPE";
    FarReference.ClientProxyTypeKey = "SPIDER_CLIENT_TYPE";
    return FarReference;
}());
exports.FarReference = FarReference;
var ClientFarReference = (function (_super) {
    __extends(ClientFarReference, _super);
    function ClientFarReference(objectId, ownerId, mainId, environment, contactId, contactAddress, contactPort) {
        if (contactId === void 0) { contactId = null; }
        if (contactAddress === void 0) { contactAddress = null; }
        if (contactPort === void 0) { contactPort = null; }
        var _this = _super.call(this, objectId, ownerId, environment, false) || this;
        _this.mainId = mainId;
        _this.contactId = contactId;
        _this.contactAddress = contactAddress;
        _this.contactPort = contactPort;
        return _this;
    }
    ClientFarReference.prototype.sendRoute = function (toId, msg) {
        if (!this.environemnt.commMedium.hasConnection(this.contactId)) {
            this.environemnt.commMedium.openConnection(this.contactId, this.contactAddress, this.contactPort);
        }
        //TODO quick fix, need to refactor to make sure that message contains the correct contact info (needed to produce return values)
        msg.contactId = this.contactId;
        msg.contactAddress = this.contactAddress;
        msg.contactPort = this.contactPort;
        this.environemnt.commMedium.sendMessage(this.contactId, new messages_1.RouteMessage(this, this.ownerId, msg));
    };
    ClientFarReference.prototype.send = function (toId, msg) {
        var holderRef = this.environemnt.thisRef;
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
    };
    ClientFarReference.prototype.sendFieldAccess = function (fieldName) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        var message = new messages_1.FieldAccessMessage(this.environemnt.thisRef, this.objectId, fieldName, promiseAlloc.promiseId);
        this.send(this.ownerId, message);
        return promiseAlloc.promise;
    };
    ClientFarReference.prototype.sendMethodInvocation = function (methodName, args) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        var message = new messages_1.MethodInvocationMessage(this.environemnt.thisRef, this.objectId, methodName, args, promiseAlloc.promiseId);
        this.send(this.ownerId, message);
        return promiseAlloc.promise;
    };
    return ClientFarReference;
}(FarReference));
exports.ClientFarReference = ClientFarReference;
var ServerFarReference = (function (_super) {
    __extends(ServerFarReference, _super);
    function ServerFarReference(objectId, ownerId, ownerAddress, ownerPort, environment) {
        var _this = _super.call(this, objectId, ownerId, environment, true) || this;
        _this.ownerAddress = ownerAddress;
        _this.ownerPort = ownerPort;
        return _this;
    }
    return ServerFarReference;
}(FarReference));
exports.ServerFarReference = ServerFarReference;
