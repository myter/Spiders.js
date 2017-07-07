Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("./messages");
const objectPool_1 = require("./objectPool");
const serialisation_1 = require("./serialisation");
const farRef_1 = require("./farRef");
const GSP_1 = require("./Replication/GSP");
const signalPool_1 = require("./Reactivivity/signalPool");
/**
 * Created by flo on 20/12/2016.
 */
var utils = require('./utils');
class MessageHandler {
    constructor(thisRef, commMedium, promisePool, objectPool, gspInstance, signalPool) {
        this.commMedium = commMedium;
        this.promisePool = promisePool;
        this.objectPool = objectPool;
        this.gspInstance = gspInstance;
        this.signalPool = signalPool;
        this.thisRef = thisRef;
    }
    sendReturnServer(actorId, actorAddress, actorPort, msg) {
        if (!(this.commMedium.hasConnection(actorId))) {
            this.commMedium.openConnection(actorId, actorAddress, actorPort);
        }
        this.commMedium.sendMessage(actorId, msg);
    }
    sendReturnClient(actorId, originalMsg, returnMsg) {
        if (this.thisRef instanceof farRef_1.ClientFarReference) {
            //Message to which actor is replying came from a different client host, send routing message to contact server actor
            if (this.thisRef.mainId != originalMsg.senderMainId) {
                this.sendReturnServer(originalMsg.contactId, originalMsg.contactAddress, originalMsg.contactPort, new messages_1.RouteMessage(this.thisRef, actorId, returnMsg));
            }
            else {
                this.commMedium.sendMessage(actorId, returnMsg);
            }
        }
        else {
            this.commMedium.sendMessage(actorId, returnMsg);
        }
    }
    //Only received as first message by a web worker (i.e. newly spawned client side actor)
    handleInstall(msg, ports) {
        var thisId = msg.actorId;
        var mainId = msg.mainId;
        var thisRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, thisId, mainId, null, this.commMedium, this.promisePool, this.objectPool);
        this.gspInstance = new GSP_1.GSP(this.commMedium, thisId, thisRef);
        var behaviourObject = serialisation_1.reconstructBehaviour({}, msg.vars, msg.methods, thisRef, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        serialisation_1.reconstructStatic(behaviourObject, msg.staticProperties, thisRef, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        var otherActorIds = msg.otherActorIds;
        this.objectPool.installBehaviourObject(behaviourObject);
        this.thisRef = thisRef;
        var parentRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, mainId, mainId, this.thisRef, this.commMedium, this.promisePool, this.objectPool);
        var channelManag = this.commMedium;
        this.signalPool = new signalPool_1.SignalPool(channelManag, thisRef, this.promisePool, this.objectPool);
        var mainPort = ports[0];
        channelManag.newConnection(mainId, mainPort);
        otherActorIds.forEach((id, index) => {
            //Ports at position 0 contains main channel (i.e. channel used to communicate with application actor)
            channelManag.newConnection(id, ports[index + 1]);
        });
        utils.installSTDLib(false, thisRef, parentRef, behaviourObject, this.commMedium, this.promisePool, this.gspInstance, this.signalPool);
    }
    handleOpenPort(msg, port) {
        var channelManager = this.commMedium;
        channelManager.newConnection(msg.actorId, port);
    }
    handleFieldAccess(msg) {
        var targetObject = this.objectPool.getObject(msg.objectId);
        var fieldVal = Reflect.get(targetObject, msg.fieldName);
        //Due to JS' crappy meta API actor might receive field access as part of a method invocation (see farRef implementation)
        if (typeof fieldVal != 'function') {
            var serialised = serialisation_1.serialise(fieldVal, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool);
            var message = new messages_1.ResolvePromiseMessage(this.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
    }
    handleMethodInvocation(msg) {
        var targetObject = this.objectPool.getObject(msg.objectId);
        var methodName = msg.methodName;
        var args = msg.args;
        var deserialisedArgs = args.map((arg) => {
            return serialisation_1.deserialise(this.thisRef, arg, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        });
        var retVal;
        try {
            retVal = targetObject[methodName].apply(targetObject, deserialisedArgs);
            //retVal = targetObject[methodName](...deserialisedArgs)
            var serialised = serialisation_1.serialise(retVal, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool);
            var message = new messages_1.ResolvePromiseMessage(this.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
        catch (reason) {
            console.log("Went wrong for : " + methodName);
            var serialised = serialisation_1.serialise(reason, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool);
            message = new messages_1.RejectPromiseMessage(this.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
    }
    handlePromiseResolve(msg) {
        var deSerialised = serialisation_1.deserialise(this.thisRef, msg.value, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        if (msg.foreign) {
            this.promisePool.resolveForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            this.promisePool.resolvePromise(msg.promiseId, deSerialised);
        }
    }
    handlePromiseReject(msg) {
        var deSerialised = serialisation_1.deserialise(this.thisRef, msg.reason, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        if (msg.foreign) {
            this.promisePool.rejectForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            this.promisePool.rejectPromise(msg.promiseId, deSerialised);
        }
    }
    //Can only be received by a server actor
    handleConnectRemote(msg, clientSocket) {
        var resolveMessage = new messages_1.ResolveConnectionMessage(this.thisRef, msg.promiseId, msg.connectionId);
        if (msg.senderType == messages_1.Message.serverSenderType) {
            this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, resolveMessage);
        }
        else {
            var socketManager = this.commMedium;
            socketManager.addNewClient(msg.senderId, clientSocket);
            this.sendReturnClient(msg.senderId, msg, resolveMessage);
        }
    }
    handleResolveConnection(msg) {
        this.commMedium.resolvePendingConnection(msg.senderId, msg.connectionId);
        var farRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, msg.senderId, msg.senderAddress, msg.senderPort, this.thisRef, this.commMedium, this.promisePool, this.objectPool);
        this.promisePool.resolvePromise(msg.promiseId, farRef.proxyify());
    }
    handleRoute(msg) {
        //TODO temp fix , works but should be refactored
        if (msg.message.typeTag == messages_1._METHOD_INVOC_) {
            var args = msg.message.args;
            args.forEach((valContainer) => {
                if (valContainer.type == serialisation_1.ValueContainer.clientFarRefType) {
                    var container = valContainer;
                    if (container.contactId == null) {
                        container.contactId = this.thisRef.ownerId;
                        container.contactAddress = this.thisRef.ownerAddress;
                        container.contactPort = this.thisRef.ownerPort;
                    }
                }
            });
        }
        this.commMedium.sendMessage(msg.targetId, msg.message);
    }
    handleGSPRound(msg) {
        this.gspInstance.roundReceived(msg.round);
    }
    handleGSPSync(msg) {
        this.gspInstance.receiveSync(msg.requesterId, msg.repliqId);
    }
    handleGSPRegister(msg) {
        if (!this.commMedium.hasConnection(msg.holderId)) {
            this.commMedium.openConnection(msg.holderId, msg.holderAddress, msg.holderPort);
        }
        this.gspInstance.registerReplicaHolder(msg.replicaId, msg.holderId);
    }
    handleRegisterExternalSignal(msg) {
        if (!this.commMedium.hasConnection(msg.requesterId)) {
            this.commMedium.openConnection(msg.requesterId, msg.requesterAddress, msg.requesterPort);
        }
        //console.log("External listener added for actor: "  + msg.requesterId + " in " + this.thisRef.ownerId + " signal: " + msg.signalId)
        this.signalPool.registerExternalListener(msg.signalId, msg.requesterId);
    }
    handleExternalSignalChange(msg) {
        //console.log("External signal changed in: " + this.thisRef.ownerId + " signal: " + msg.signalId)
        let newVal = serialisation_1.deserialise(this.thisRef, msg.newVal, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        this.signalPool.sourceChanged(msg.signalId, newVal);
    }
    //Ports are needed for client side actor communication and cannot be serialised together with message objects (is always empty for server-side code)
    //Client socket is provided by server-side implementation and is used whenever a client connects remotely to a server actor
    dispatch(msg, ports = [], clientSocket = null) {
        switch (msg.typeTag) {
            case messages_1._INSTALL_BEHAVIOUR_:
                this.handleInstall(msg, ports);
                break;
            case messages_1._OPEN_PORT_:
                this.handleOpenPort(msg, ports[0]);
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
            case messages_1._CONNECT_REMOTE_:
                this.handleConnectRemote(msg, clientSocket);
                break;
            case messages_1._RESOLVE_CONNECTION_:
                this.handleResolveConnection(msg);
                break;
            case messages_1._ROUTE_:
                this.handleRoute(msg);
                break;
            case messages_1._GSP_ROUND_:
                this.handleGSPRound(msg);
                break;
            case messages_1._GSP_SYNC_:
                this.handleGSPSync(msg);
                break;
            case messages_1._GSP_REGISTER_:
                this.handleGSPRegister(msg);
                break;
            case messages_1._REGISTER_EXTERNAL_SIGNAL_:
                this.handleRegisterExternalSignal(msg);
                break;
            case messages_1._EXTERNAL_SIGNAL_CHANGE_:
                this.handleExternalSignalChange(msg);
                break;
            default:
                throw "Unknown message in actor : " + msg.toString();
        }
    }
}
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=messageHandler.js.map