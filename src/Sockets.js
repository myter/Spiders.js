Object.defineProperty(exports, "__esModule", { value: true });
const CommMedium_1 = require("./CommMedium");
/**
 * Created by flo on 19/12/2016.
 */
class SocketHandler {
    constructor(owner) {
        this.owner = owner;
        this.disconnectedActors = [];
        this.pendingMessages = new Map();
        this.fuckUpMessage = new Map();
    }
    addDisconnected(actorId) {
        this.disconnectedActors.push(actorId);
        this.pendingMessages.set(actorId, []);
    }
    removeFromDisconnected(actorId, connection) {
        this.owner.connectedActors.set(actorId, connection);
        this.disconnectedActors = this.disconnectedActors.filter((id) => {
            id != actorId;
        });
        if (this.pendingMessages.has(actorId)) {
            var messages = this.pendingMessages.get(actorId);
            messages.forEach((msg) => {
                this.sendMessage(actorId, msg);
            });
            this.pendingMessages.delete(actorId);
        }
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId, actorAddress, actorPort) {
        var that = this;
        var connection = require('socket.io-client')('http://' + actorAddress + ":" + actorPort);
        this.addDisconnected(actorId);
        connection.on('connect', () => {
            that.removeFromDisconnected(actorId, connection);
            //TODO To remove once solution found
            if (that.fuckUpMessage.has(actorId)) {
                that.fuckUpMessage.get(actorId).forEach((msg) => {
                    that.sendMessage(actorId, msg);
                });
            }
        });
        connection.on('message', function (data) {
            that.messageHandler.dispatch(data);
        });
        connection.on('disconnect', function () {
            that.disconnectedActors.push(actorId);
        });
    }
    sendMessage(actorId, msg) {
        if (this.disconnectedActors.indexOf(actorId) != -1) {
            this.pendingMessages.get(actorId).push(msg);
        }
        else if (this.owner.connectedActors.has(actorId)) {
            var sock = this.owner.connectedActors.get(actorId);
            sock.emit('message', msg);
        }
        else {
            //TODO TEMP
            if (this.fuckUpMessage.has(actorId)) {
                this.fuckUpMessage.get(actorId).push(msg);
            }
            else {
                var q = [msg];
                this.fuckUpMessage.set(actorId, q);
            }
            //throw new Error("Unable to send message to unknown actor (socket handler) in " + msg.fieldName + " to : " + actorId + " in : " + this.messageHandler.thisRef.ownerId)
        }
    }
}
exports.SocketHandler = SocketHandler;
class ServerSocketManager extends CommMedium_1.CommMedium {
    constructor(ip, socketPort, environment) {
        super(environment);
        var io = require('socket.io');
        this.socketIp = ip;
        this.socketPort = socketPort;
        this.socket = io(socketPort);
        this.connectedClients = new Map();
        this.socketHandler.messageHandler = environment.messageHandler;
        this.socket.on('connection', (client) => {
            client.on('message', (data) => {
                environment.messageHandler.dispatch(data, [], client);
            });
            client.on('close', () => {
                //TODO
            });
        });
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId, actorAddress, actorPort) {
        this.socketHandler.openConnection(actorId, actorAddress, actorPort);
    }
    addNewClient(actorId, socket) {
        this.connectedClients.set(actorId, socket);
    }
    sendMessage(actorId, msg) {
        if (this.connectedClients.has(actorId)) {
            this.connectedClients.get(actorId).emit('message', JSON.stringify(msg));
        }
        else {
            this.socketHandler.sendMessage(actorId, msg);
        }
    }
    hasConnection(actorId) {
        return (this.socketHandler.disconnectedActors.indexOf(actorId) != -1) || this.connectedActors.has(actorId);
    }
    closeAll() {
        this.socket.close();
        this.connectedActors.forEach((sock) => {
            sock.close();
        });
    }
}
exports.ServerSocketManager = ServerSocketManager;
//# sourceMappingURL=Sockets.js.map