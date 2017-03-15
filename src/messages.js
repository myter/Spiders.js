"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var farRef_1 = require("./farRef");
var Message = (function () {
    function Message(typeTag, senderRef) {
        this.typeTag = typeTag;
        this.senderId = senderRef.ownerId;
        if (senderRef instanceof farRef_1.ServerFarReference) {
            this.senderType = Message.serverSenderType;
            this.senderAddress = senderRef.ownerAddress;
            this.senderPort = senderRef.ownerPort;
        }
        else {
            var clientRef = senderRef;
            this.senderType = Message.clientSenderType;
            this.senderMainId = clientRef.mainId;
            this.contactId = clientRef.contactId;
            this.contactAddress = clientRef.contactAddress;
            this.contactPort = clientRef.contactPort;
        }
    }
    Message.serverSenderType = "_SERVER_";
    Message.clientSenderType = "_CLIENT_";
    return Message;
}());
exports.Message = Message;
exports._INSTALL_BEHAVIOUR_ = 0;
var InstallBehaviourMessage = (function (_super) {
    __extends(InstallBehaviourMessage, _super);
    function InstallBehaviourMessage(senderRef, mainId, actorId, vars, methods, staticProperties, otherActorIds) {
        _super.call(this, exports._INSTALL_BEHAVIOUR_, senderRef);
        this.mainId = mainId;
        this.actorId = actorId;
        this.vars = vars;
        this.methods = methods;
        this.staticProperties = staticProperties;
        this.otherActorIds = otherActorIds;
    }
    return InstallBehaviourMessage;
}(Message));
exports.InstallBehaviourMessage = InstallBehaviourMessage;
exports._FIELD_ACCESS_ = 1;
var FieldAccessMessage = (function (_super) {
    __extends(FieldAccessMessage, _super);
    function FieldAccessMessage(senderRef, objectId, fieldName, promiseId) {
        _super.call(this, exports._FIELD_ACCESS_, senderRef);
        this.objectId = objectId;
        this.fieldName = fieldName;
        this.promiseId = promiseId;
    }
    return FieldAccessMessage;
}(Message));
exports.FieldAccessMessage = FieldAccessMessage;
exports._METHOD_INVOC_ = 2;
var MethodInvocationMessage = (function (_super) {
    __extends(MethodInvocationMessage, _super);
    function MethodInvocationMessage(senderRef, objectId, methodName, args, promiseId) {
        _super.call(this, exports._METHOD_INVOC_, senderRef);
        this.objectId = objectId;
        this.methodName = methodName;
        this.args = args;
        this.promiseId = promiseId;
    }
    return MethodInvocationMessage;
}(Message));
exports.MethodInvocationMessage = MethodInvocationMessage;
exports._RESOLVE_PROMISE_ = 3;
var ResolvePromiseMessage = (function (_super) {
    __extends(ResolvePromiseMessage, _super);
    function ResolvePromiseMessage(senderRef, promiseId, value, foreign) {
        if (foreign === void 0) { foreign = false; }
        _super.call(this, exports._RESOLVE_PROMISE_, senderRef);
        this.promiseId = promiseId;
        this.value = value;
        this.foreign = foreign;
    }
    return ResolvePromiseMessage;
}(Message));
exports.ResolvePromiseMessage = ResolvePromiseMessage;
exports._REJECT_PROMISE_ = 4;
var RejectPromiseMessage = (function (_super) {
    __extends(RejectPromiseMessage, _super);
    function RejectPromiseMessage(senderRef, promiseId, reason, foreign) {
        if (foreign === void 0) { foreign = false; }
        _super.call(this, exports._REJECT_PROMISE_, senderRef);
        this.promiseId = promiseId;
        this.reason = reason;
        this.foreign = foreign;
    }
    return RejectPromiseMessage;
}(Message));
exports.RejectPromiseMessage = RejectPromiseMessage;
exports._OPEN_PORT_ = 5;
var OpenPortMessage = (function (_super) {
    __extends(OpenPortMessage, _super);
    function OpenPortMessage(senderRef, actorId) {
        _super.call(this, exports._OPEN_PORT_, senderRef);
        this.actorId = actorId;
    }
    return OpenPortMessage;
}(Message));
exports.OpenPortMessage = OpenPortMessage;
exports._CONNECT_REMOTE_ = 6;
var ConnectRemoteMessage = (function (_super) {
    __extends(ConnectRemoteMessage, _super);
    function ConnectRemoteMessage(senderRef, promiseId, connectionId) {
        _super.call(this, exports._CONNECT_REMOTE_, senderRef);
        this.promiseId = promiseId;
        this.connectionId = connectionId;
    }
    return ConnectRemoteMessage;
}(Message));
exports.ConnectRemoteMessage = ConnectRemoteMessage;
exports._RESOLVE_CONNECTION_ = 7;
var ResolveConnectionMessage = (function (_super) {
    __extends(ResolveConnectionMessage, _super);
    function ResolveConnectionMessage(senderRef, promiseId, connectionId) {
        _super.call(this, exports._RESOLVE_CONNECTION_, senderRef);
        this.promiseId = promiseId;
        this.connectionId = connectionId;
    }
    return ResolveConnectionMessage;
}(Message));
exports.ResolveConnectionMessage = ResolveConnectionMessage;
exports._ROUTE_ = 8;
var RouteMessage = (function (_super) {
    __extends(RouteMessage, _super);
    function RouteMessage(senderRef, targetId, message) {
        _super.call(this, exports._ROUTE_, senderRef);
        this.message = message;
        this.targetId = targetId;
    }
    return RouteMessage;
}(Message));
exports.RouteMessage = RouteMessage;
