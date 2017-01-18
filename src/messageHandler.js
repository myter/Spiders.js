const messages_1 = require("./messages");
const serialisation_1 = require("./serialisation");
const farRef_1 = require("./farRef");
/**
 * Created by flo on 20/12/2016.
 */
var utils = require('./utils');
class MessageHandler {
    constructor(thisRef, commMedium, promisePool, objectPool) {
        this.commMedium = commMedium;
        this.promisePool = promisePool;
        this.objectPool = objectPool;
        this.thisRef = thisRef;
    }
    sendReturnServer(actorId, actorAddress, actorPort, msg) {
        if (this.thisRef instanceof farRef_1.ServerFarReference) {
            if (!(this.commMedium.hasConnection(actorId))) {
                this.commMedium.openConnection(actorId, actorAddress, actorPort);
            }
        }
        else {
        }
        this.commMedium.sendMessage(actorId, msg);
    }
    //TODO this is probably not needed anymore (at least for server side)
    handleActorCreated(msg) {
        if (utils.isBrowser()) {
        }
        else {
        }
    }
    handleFieldAccess(msg) {
        var targetObject = this.objectPool.getObject(msg.objectId);
        var fieldVal = Reflect.get(targetObject, msg.fieldName);
        //Due to JS' crappy meta API actor might receive field access as part of a method invocation (see farRef implementation)
        if (typeof fieldVal != 'function') {
            var serialised = serialisation_1.serialise(fieldVal, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, new messages_1.ResolvePromiseMessage(this.thisRef, msg.promiseId, serialised));
            }
            else {
            }
        }
    }
    handleMethodInvocation(msg) {
        var targetObject = this.objectPool.getObject(msg.objectId);
        var methodName = msg.methodName;
        var args = msg.args;
        var deserialisedArgs = args.map((arg) => {
            return serialisation_1.deserialise(this.thisRef, arg, this.promisePool, this.commMedium, this.objectPool);
        });
        var retVal;
        try {
            retVal = targetObject[methodName].apply(targetObject, deserialisedArgs);
            var serialised = serialisation_1.serialise(retVal, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, new messages_1.ResolvePromiseMessage(this.thisRef, msg.promiseId, serialised));
            }
            else {
            }
        }
        catch (reason) {
            var serialised = serialisation_1.serialise(reason, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, new messages_1.RejectPromiseMessage(this.thisRef, msg.promiseId, serialised));
            }
            else {
            }
        }
    }
    handlePromiseResolve(msg) {
        var deSerialised = serialisation_1.deserialise(this.thisRef, msg.value, this.promisePool, this.commMedium, this.objectPool);
        if (msg.foreign) {
            this.promisePool.resolveForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            this.promisePool.resolvePromise(msg.promiseId, deSerialised);
        }
    }
    handlePromiseReject(msg) {
        var deSerialised = serialisation_1.deserialise(this.thisRef, msg.reason, this.promisePool, this.commMedium, this.objectPool);
        if (msg.foreign) {
            this.promisePool.rejectForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            this.promisePool.rejectPromise(msg.promiseId, deSerialised);
        }
    }
    dispatch(msg) {
        switch (msg.typeTag) {
            case messages_1._ACTOR_CREATED_:
                this.handleActorCreated(msg);
                break;
            case messages_1._FIELD_ACCESS_:
                this.handleFieldAccess(msg);
                break;
            case messages_1._METHOD_INVOC_:
                this.handleMethodInvocation(msg);
                break;
            case messages_1._RESOLVE_PROMISE_:
                this.handlePromiseResolve(msg);
                break;
            case messages_1._REJECT_PROMISE_:
                this.handlePromiseReject(msg);
                break;
            default:
                throw "Unknown message in actor : " + msg.toString();
        }
    }
}
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=messageHandler.js.map