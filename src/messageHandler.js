Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
const ObjectPool_1 = require("./ObjectPool");
const serialisation_1 = require("./serialisation");
const FarRef_1 = require("./FarRef");
const ActorSTDLib_1 = require("./ActorSTDLib");
/**
 * Created by flo on 20/12/2016.
 */
class MessageHandler {
    constructor(environment) {
        this.environment = environment;
    }
    sendReturnServer(actorId, actorAddress, actorPort, msg, routing = false) {
        let commMedium = this.environment.commMedium;
        if (!(commMedium.hasConnection(actorId))) {
            commMedium.openConnection(actorId, actorAddress, actorPort);
        }
        if (routing) {
            commMedium.sendRouteMessage(msg.targetId, actorId, msg);
        }
        else {
            commMedium.sendMessage(actorId, msg);
        }
    }
    sendReturnClient(actorId, originalMsg, returnMsg) {
        let thisRef = this.environment.thisRef;
        let commMedium = this.environment.commMedium;
        if (thisRef instanceof FarRef_1.ClientFarReference) {
            //Message to which actor is replying came from a different client host, send routing message to contact server actor
            if (thisRef.mainId != originalMsg.senderMainId) {
                this.sendReturnServer(originalMsg.contactId, originalMsg.contactAddress, originalMsg.contactPort, new Message_1.RouteMessage(this.environment.thisRef, actorId, returnMsg), true);
            }
            else {
                commMedium.sendMessage(actorId, returnMsg);
            }
        }
        else {
            commMedium.sendMessage(actorId, returnMsg);
        }
    }
    //Only received as first message by a web worker (i.e. newly spawned client side actor)
    handleInstall(msg, ports) {
        var thisId = msg.actorId;
        var mainId = msg.mainId;
        var behaviourObject = serialisation_1.reconstructBehaviour({}, msg.vars, msg.methods, msg.methAnnots, this.environment);
        var actorMirror = serialisation_1.reconstructBehaviour({}, msg.mirrorVars, msg.mirrorMethods, msg.mirrorMethAnnots, this.environment);
        actorMirror.bindBase(this.environment, serialisation_1.serialise);
        this.environment.actorMirror = actorMirror;
        serialisation_1.reconstructStatic(behaviourObject, msg.staticProperties, this.environment);
        this.environment.initialise(thisId, mainId, behaviourObject);
        var otherActorIds = msg.otherActorIds;
        var parentRef = new FarRef_1.ClientFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, msg.senderRef[FarRef_1.FarReference.farRefAccessorKey].objectFields, msg.senderRef[FarRef_1.FarReference.farRefAccessorKey].objectMethods, mainId, mainId, this.environment);
        let channelManag = this.environment.commMedium;
        var mainPort = ports[0];
        channelManag.newConnection(mainId, mainPort);
        otherActorIds.forEach((id, index) => {
            //Ports at position 0 contains main channel (i.e. channel used to communicate with application actor)
            channelManag.newConnection(id, ports[index + 1]);
        });
        let stdLib = new ActorSTDLib_1.ActorSTDLib(this.environment);
        this.environment.actorMirror.initialise(stdLib, false, parentRef);
    }
    handleOpenPort(msg, port) {
        var channelManager = this.environment.commMedium;
        channelManager.newConnection(msg.actorId, port);
    }
    handleFieldAccess(msg) {
        var targetObject = this.environment.objectPool.getObject(msg.objectId);
        this.environment.actorMirror.receiveAccess(msg.senderRef, targetObject, msg.fieldName, () => {
            var fieldVal = Reflect.get(targetObject, msg.fieldName);
            //Due to JS' crappy meta API actor might receive field access as part of a method invocation (see farRef implementation)
            if (typeof fieldVal != 'function') {
                var serialised = serialisation_1.serialise(fieldVal, msg.senderId, this.environment);
                var message = new Message_1.ResolvePromiseMessage(this.environment.thisRef, msg.promiseId, serialised);
                if (msg.senderType == Message_1.Message.serverSenderType) {
                    this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
                }
                else {
                    this.sendReturnClient(msg.senderId, msg, message);
                }
            }
            return undefined;
        });
    }
    handleMethodInvocation(msg) {
        var targetObject = this.environment.objectPool.getObject(msg.objectId);
        var methodName = msg.methodName;
        var args = msg.args;
        var deserialisedArgs = args.map((arg) => {
            return serialisation_1.deserialise(arg, this.environment);
        });
        let performInvocation = () => {
            let retVal;
            try {
                retVal = targetObject[methodName].apply(targetObject, deserialisedArgs);
            }
            catch (reason) {
                console.log("Went wrong for : " + methodName);
                console.log(reason);
                retVal = reason;
            }
            return retVal;
        };
        let sendReturn = (returnVal) => {
            let serialised = serialisation_1.serialise(returnVal, msg.senderId, this.environment);
            let message;
            if (returnVal instanceof Error) {
                message = new Message_1.RejectPromiseMessage(this.environment.thisRef, msg.promiseId, serialised);
            }
            else {
                message = new Message_1.ResolvePromiseMessage(this.environment.thisRef, msg.promiseId, serialised);
            }
            if (msg.senderType == Message_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        };
        this.environment.actorMirror.receiveInvocation(msg.senderRef, targetObject, methodName, deserialisedArgs, performInvocation, sendReturn);
    }
    handlePromiseResolve(msg) {
        let promisePool = this.environment.promisePool;
        var deSerialised = serialisation_1.deserialise(msg.value, this.environment);
        if (msg.foreign) {
            promisePool.resolveForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            promisePool.resolvePromise(msg.promiseId, deSerialised);
        }
    }
    handlePromiseReject(msg) {
        let promisePool = this.environment.promisePool;
        var deSerialised = serialisation_1.deserialise(msg.reason, this.environment);
        if (msg.foreign) {
            promisePool.rejectForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            promisePool.rejectPromise(msg.promiseId, deSerialised);
        }
    }
    handleRoute(msg) {
        //Message has been serialised and has therefore lost its "setClockTime" method (no way around this, at some point need to call JSON.stringify to send message between actors)
        msg.message.setClockTime = (clockTime) => { };
        //Must ensure that any client references "leaking" form this server actor also have the correct contact information
        if (msg.message.typeTag == Message_1._METHOD_INVOC_) {
            var args = msg.message.args;
            args.forEach((valContainer) => {
                if (valContainer.type == serialisation_1.ValueContainer.clientFarRefType) {
                    var container = valContainer;
                    if (container.contactId == null) {
                        let thisRef = this.environment.thisRef;
                        container.contactId = thisRef.ownerId;
                        container.contactAddress = thisRef.ownerAddress;
                        container.contactPort = thisRef.ownerPort;
                    }
                }
            });
        }
        if (msg.message.typeTag == Message_1._RESOLVE_PROMISE_) {
            var value = msg.message.value;
            if (value.type == serialisation_1.ValueContainer.clientFarRefType) {
                let container = value;
                if (container.contactId == null) {
                    let thisRef = this.environment.thisRef;
                    container.contactId = thisRef.ownerId;
                    container.contactAddress = thisRef.ownerAddress;
                    container.contactPort = thisRef.ownerPort;
                }
            }
        }
        this.environment.commMedium.sendMessage(msg.targetId, msg.message);
    }
    //Ports are needed for client side actor communication and cannot be serialised together with message objects (is always empty for server-side code)
    //Client socket is provided by server-side implementation and is used whenever a client connects remotely to a server actor
    dispatch(msg, ports = [], clientSocket = null) {
        msg.senderRef = serialisation_1.deserialise(msg.senderRef, this.environment);
        switch (msg.typeTag) {
            case Message_1._INSTALL_BEHAVIOUR_:
                this.handleInstall(msg, ports);
                break;
            case Message_1._OPEN_PORT_:
                this.handleOpenPort(msg, ports[0]);
                break;
            case Message_1._FIELD_ACCESS_:
                this.handleFieldAccess(msg);
                break;
            case Message_1._METHOD_INVOC_:
                this.handleMethodInvocation(msg);
                break;
            case Message_1._RESOLVE_PROMISE_:
                this.handlePromiseResolve(msg);
                break;
            case Message_1._REJECT_PROMISE_:
                this.handlePromiseReject(msg);
                break;
            case Message_1._ROUTE_:
                this.handleRoute(msg);
                break;
            default:
                throw "Unknown message in actor : " + msg.toString();
        }
    }
}
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=messageHandler.js.map