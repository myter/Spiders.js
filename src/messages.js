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
            this.senderType = Message.clientSenderType;
        }
    }
}
Message.serverSenderType = "_SERVER_";
Message.clientSenderType = "_CLIENT_";
exports.Message = Message;
exports._ACTOR_CREATED_ = 0;
class ActorCreatedMessage extends Message {
    constructor(actorAddress, actorPort, actorId) {
        super(exports._ACTOR_CREATED_, null);
        this.actorAddress = actorAddress;
        this.actorPort = actorPort;
        this.actorId = actorId;
    }
}
exports.ActorCreatedMessage = ActorCreatedMessage;
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
//# sourceMappingURL=messages.js.map