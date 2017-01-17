class Message {
    constructor(typeTag, senderId, senderAddress, senderPort) {
        this.typeTag = typeTag;
        this.senderId = senderId;
        this.senderAddress = senderAddress;
        this.senderPort = senderPort;
    }
}
exports.Message = Message;
exports._ACTOR_CREATED_ = 0;
class ActorCreatedMessage extends Message {
    constructor(actorAddress, actorPort, actorId) {
        super(exports._ACTOR_CREATED_, actorId, actorAddress, actorPort);
        this.actorAddress = actorAddress;
        this.actorPort = actorPort;
        this.actorId = actorId;
    }
}
exports.ActorCreatedMessage = ActorCreatedMessage;
exports._FIELD_ACCESS_ = 1;
class FieldAccessMessage extends Message {
    constructor(senderId, senderAddress, senderPort, objectId, fieldName, promiseId) {
        super(exports._FIELD_ACCESS_, senderId, senderAddress, senderPort);
        this.objectId = objectId;
        this.fieldName = fieldName;
        this.promiseId = promiseId;
    }
}
exports.FieldAccessMessage = FieldAccessMessage;
exports._METHOD_INVOC_ = 2;
class MethodInvocationMessage extends Message {
    constructor(senderId, senderAddress, senderPort, objectId, methodName, args, promiseId) {
        super(exports._METHOD_INVOC_, senderId, senderAddress, senderPort);
        this.objectId = objectId;
        this.methodName = methodName;
        this.args = args;
        this.promiseId = promiseId;
    }
}
exports.MethodInvocationMessage = MethodInvocationMessage;
exports._RESOLVE_PROMISE_ = 3;
class ResolvePromiseMessage extends Message {
    constructor(senderId, senderAddress, senderPort, promiseId, value, foreign = false) {
        super(exports._RESOLVE_PROMISE_, senderId, senderAddress, senderPort);
        this.promiseId = promiseId;
        this.value = value;
        this.foreign = foreign;
    }
}
exports.ResolvePromiseMessage = ResolvePromiseMessage;
exports._REJECT_PROMISE_ = 4;
class RejectPromiseMessage extends Message {
    constructor(senderId, senderAddress, senderPort, promiseId, reason, foreign = false) {
        super(exports._REJECT_PROMISE_, senderId, senderAddress, senderPort);
        this.promiseId = promiseId;
        this.reason = reason;
        this.foreign = foreign;
    }
}
exports.RejectPromiseMessage = RejectPromiseMessage;
//# sourceMappingURL=messages.js.map