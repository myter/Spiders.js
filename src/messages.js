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
        var _this = _super.call(this, exports._INSTALL_BEHAVIOUR_, senderRef) || this;
        _this.mainId = mainId;
        _this.actorId = actorId;
        _this.vars = vars;
        _this.methods = methods;
        _this.staticProperties = staticProperties;
        _this.otherActorIds = otherActorIds;
        return _this;
    }
    return InstallBehaviourMessage;
}(Message));
exports.InstallBehaviourMessage = InstallBehaviourMessage;
exports._FIELD_ACCESS_ = 1;
var FieldAccessMessage = (function (_super) {
    __extends(FieldAccessMessage, _super);
    function FieldAccessMessage(senderRef, objectId, fieldName, promiseId) {
        var _this = _super.call(this, exports._FIELD_ACCESS_, senderRef) || this;
        _this.objectId = objectId;
        _this.fieldName = fieldName;
        _this.promiseId = promiseId;
        return _this;
    }
    return FieldAccessMessage;
}(Message));
exports.FieldAccessMessage = FieldAccessMessage;
exports._METHOD_INVOC_ = 2;
var MethodInvocationMessage = (function (_super) {
    __extends(MethodInvocationMessage, _super);
    function MethodInvocationMessage(senderRef, objectId, methodName, args, promiseId) {
        var _this = _super.call(this, exports._METHOD_INVOC_, senderRef) || this;
        _this.objectId = objectId;
        _this.methodName = methodName;
        _this.args = args;
        _this.promiseId = promiseId;
        return _this;
    }
    return MethodInvocationMessage;
}(Message));
exports.MethodInvocationMessage = MethodInvocationMessage;
exports._RESOLVE_PROMISE_ = 3;
var ResolvePromiseMessage = (function (_super) {
    __extends(ResolvePromiseMessage, _super);
    function ResolvePromiseMessage(senderRef, promiseId, value, foreign) {
        if (foreign === void 0) { foreign = false; }
        var _this = _super.call(this, exports._RESOLVE_PROMISE_, senderRef) || this;
        _this.promiseId = promiseId;
        _this.value = value;
        _this.foreign = foreign;
        return _this;
    }
    return ResolvePromiseMessage;
}(Message));
exports.ResolvePromiseMessage = ResolvePromiseMessage;
exports._REJECT_PROMISE_ = 4;
var RejectPromiseMessage = (function (_super) {
    __extends(RejectPromiseMessage, _super);
    function RejectPromiseMessage(senderRef, promiseId, reason, foreign) {
        if (foreign === void 0) { foreign = false; }
        var _this = _super.call(this, exports._REJECT_PROMISE_, senderRef) || this;
        _this.promiseId = promiseId;
        _this.reason = reason;
        _this.foreign = foreign;
        return _this;
    }
    return RejectPromiseMessage;
}(Message));
exports.RejectPromiseMessage = RejectPromiseMessage;
exports._OPEN_PORT_ = 5;
var OpenPortMessage = (function (_super) {
    __extends(OpenPortMessage, _super);
    function OpenPortMessage(senderRef, actorId) {
        var _this = _super.call(this, exports._OPEN_PORT_, senderRef) || this;
        _this.actorId = actorId;
        return _this;
    }
    return OpenPortMessage;
}(Message));
exports.OpenPortMessage = OpenPortMessage;
exports._CONNECT_REMOTE_ = 6;
var ConnectRemoteMessage = (function (_super) {
    __extends(ConnectRemoteMessage, _super);
    function ConnectRemoteMessage(senderRef, promiseId, connectionId) {
        var _this = _super.call(this, exports._CONNECT_REMOTE_, senderRef) || this;
        _this.promiseId = promiseId;
        _this.connectionId = connectionId;
        return _this;
    }
    return ConnectRemoteMessage;
}(Message));
exports.ConnectRemoteMessage = ConnectRemoteMessage;
exports._RESOLVE_CONNECTION_ = 7;
var ResolveConnectionMessage = (function (_super) {
    __extends(ResolveConnectionMessage, _super);
    function ResolveConnectionMessage(senderRef, promiseId, connectionId) {
        var _this = _super.call(this, exports._RESOLVE_CONNECTION_, senderRef) || this;
        _this.promiseId = promiseId;
        _this.connectionId = connectionId;
        return _this;
    }
    return ResolveConnectionMessage;
}(Message));
exports.ResolveConnectionMessage = ResolveConnectionMessage;
exports._ROUTE_ = 8;
var RouteMessage = (function (_super) {
    __extends(RouteMessage, _super);
    function RouteMessage(senderRef, targetId, message) {
        var _this = _super.call(this, exports._ROUTE_, senderRef) || this;
        _this.message = message;
        _this.targetId = targetId;
        return _this;
    }
    return RouteMessage;
}(Message));
exports.RouteMessage = RouteMessage;
//TODO address and port will be removed once communication refactor is done
exports._GSP_REGISTER_ = 9;
var GSPRegisterMessage = (function (_super) {
    __extends(GSPRegisterMessage, _super);
    function GSPRegisterMessage(senderRef, holderId, replicaId, holderAddress, holderPort, roundNr) {
        var _this = _super.call(this, exports._GSP_REGISTER_, senderRef) || this;
        _this.holderId = holderId;
        _this.replicaId = replicaId;
        _this.holderAddress = holderAddress;
        _this.holderPort = holderPort;
        _this.roundNr = roundNr;
        return _this;
    }
    return GSPRegisterMessage;
}(Message));
exports.GSPRegisterMessage = GSPRegisterMessage;
exports._GSP_ROUND_ = 10;
var GSPRoundMessage = (function (_super) {
    __extends(GSPRoundMessage, _super);
    function GSPRoundMessage(senderRef, round) {
        var _this = _super.call(this, exports._GSP_ROUND_, senderRef) || this;
        _this.round = round;
        _this.senderId = senderRef.ownerId;
        return _this;
    }
    return GSPRoundMessage;
}(Message));
exports.GSPRoundMessage = GSPRoundMessage;
exports._GSP_SYNC_ = 11;
var GSPSyncMessage = (function (_super) {
    __extends(GSPSyncMessage, _super);
    function GSPSyncMessage(senderRef, requesterId, repliqId) {
        var _this = _super.call(this, exports._GSP_SYNC_, senderRef) || this;
        _this.requesterId = requesterId;
        _this.repliqId = repliqId;
        return _this;
    }
    return GSPSyncMessage;
}(Message));
exports.GSPSyncMessage = GSPSyncMessage;
exports._REGISTER_EXTERNAL_SIGNAL_ = 12;
var RegisterExternalSignalMessage = (function (_super) {
    __extends(RegisterExternalSignalMessage, _super);
    function RegisterExternalSignalMessage(senderRef, requesterId, signalId, requesterAddress, requesterPort) {
        var _this = _super.call(this, exports._REGISTER_EXTERNAL_SIGNAL_, senderRef) || this;
        _this.requesterId = requesterId;
        _this.signalId = signalId;
        _this.requesterAddress = requesterAddress;
        _this.requesterPort = requesterPort;
        return _this;
    }
    return RegisterExternalSignalMessage;
}(Message));
exports.RegisterExternalSignalMessage = RegisterExternalSignalMessage;
exports._EXTERNAL_SIGNAL_CHANGE_ = 13;
var ExternalSignalChangeMessage = (function (_super) {
    __extends(ExternalSignalChangeMessage, _super);
    function ExternalSignalChangeMessage(senderRef, signalId, newVal) {
        var _this = _super.call(this, exports._EXTERNAL_SIGNAL_CHANGE_, senderRef) || this;
        _this.signalId = signalId;
        _this.newVal = newVal;
        return _this;
    }
    return ExternalSignalChangeMessage;
}(Message));
exports.ExternalSignalChangeMessage = ExternalSignalChangeMessage;
exports._EXTERNAL_SIGNAL_DELETE_ = 14;
var ExternalSignalDeleteMessage = (function (_super) {
    __extends(ExternalSignalDeleteMessage, _super);
    function ExternalSignalDeleteMessage(senderRef, signalId) {
        var _this = _super.call(this, exports._EXTERNAL_SIGNAL_DELETE_, senderRef) || this;
        _this.signalId = signalId;
        return _this;
    }
    return ExternalSignalDeleteMessage;
}(Message));
exports.ExternalSignalDeleteMessage = ExternalSignalDeleteMessage;
