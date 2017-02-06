const farRef_1 = require("./farRef");
class Message {
    constructor(typeTag, senderRef) {
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
}
Message.serverSenderType = "_SERVER_";
Message.clientSenderType = "_CLIENT_";
exports.Message = Message;
exports._INSTALL_BEHAVIOUR_ = 0;
class InstallBehaviourMessage extends Message {
    constructor(senderRef, mainId, actorId, vars, methods, staticProperties, otherActorIds) {
        super(exports._INSTALL_BEHAVIOUR_, senderRef);
        this.mainId = mainId;
        this.actorId = actorId;
        this.vars = vars;
        this.methods = methods;
        this.staticProperties = staticProperties;
        this.otherActorIds = otherActorIds;
    }
}
exports.InstallBehaviourMessage = InstallBehaviourMessage;
exports._FIELD_ACCESS_ = 1;
class FieldAccessMessage extends Message {
    constructor(senderRef, objectId, fieldName, promiseId) {
        super(exports._FIELD_ACCESS_, senderRef);
        this.objectId = objectId;
        this.fieldName = fieldName;
        this.promiseId = promiseId;
    }
}
exports.FieldAccessMessage = FieldAccessMessage;
exports._METHOD_INVOC_ = 2;
class MethodInvocationMessage extends Message {
    constructor(senderRef, objectId, methodName, args, promiseId) {
        super(exports._METHOD_INVOC_, senderRef);
        this.objectId = objectId;
        this.methodName = methodName;
        this.args = args;
        this.promiseId = promiseId;
    }
}
exports.MethodInvocationMessage = MethodInvocationMessage;
exports._RESOLVE_PROMISE_ = 3;
class ResolvePromiseMessage extends Message {
    constructor(senderRef, promiseId, value, foreign = false) {
        super(exports._RESOLVE_PROMISE_, senderRef);
        this.promiseId = promiseId;
        this.value = value;
        this.foreign = foreign;
    }
}
exports.ResolvePromiseMessage = ResolvePromiseMessage;
exports._REJECT_PROMISE_ = 4;
class RejectPromiseMessage extends Message {
    constructor(senderRef, promiseId, reason, foreign = false) {
        super(exports._REJECT_PROMISE_, senderRef);
        this.promiseId = promiseId;
        this.reason = reason;
        this.foreign = foreign;
    }
}
exports.RejectPromiseMessage = RejectPromiseMessage;
exports._OPEN_PORT_ = 5;
class OpenPortMessage extends Message {
    constructor(senderRef, actorId) {
        super(exports._OPEN_PORT_, senderRef);
        this.actorId = actorId;
    }
}
exports.OpenPortMessage = OpenPortMessage;
exports._CONNECT_REMOTE_ = 6;
class ConnectRemoteMessage extends Message {
    constructor(senderRef, promiseId, connectionId) {
        super(exports._CONNECT_REMOTE_, senderRef);
        this.promiseId = promiseId;
        this.connectionId = connectionId;
    }
}
exports.ConnectRemoteMessage = ConnectRemoteMessage;
exports._RESOLVE_CONNECTION_ = 7;
class ResolveConnectionMessage extends Message {
    constructor(senderRef, promiseId, connectionId) {
        super(exports._RESOLVE_CONNECTION_, senderRef);
        this.promiseId = promiseId;
        this.connectionId = connectionId;
    }
}
exports.ResolveConnectionMessage = ResolveConnectionMessage;
exports._ROUTE_ = 8;
class RouteMessage extends Message {
    constructor(senderRef, targetId, message) {
        super(exports._ROUTE_, senderRef);
        this.message = message;
        this.targetId = targetId;
    }
}
exports.RouteMessage = RouteMessage;
//# sourceMappingURL=messages.js.map