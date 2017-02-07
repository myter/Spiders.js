const commMedium_1 = require("./commMedium");
/**
 * Created by flo on 19/12/2016.
 */
var io = require('socket.io');
class SocketHandler {
    constructor(owner) {
        this.owner = owner;
        this.disconnectedActors = [];
        this.pendingMessages = new Map();
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
        }
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId, actorAddress, actorPort) {
        var that = this;
        var connection = require('socket.io-client')('http://' + actorAddress + ":" + actorPort);
        this.addDisconnected(actorId);
        connection.on('connect', () => {
            that.removeFromDisconnected(actorId, connection);
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
            var msgs = this.pendingMessages.get(actorId);
            msgs.push(msg);
            this.pendingMessages.set(actorId, msgs);
        }
        else if (this.owner.connectedActors.has(actorId)) {
            var sock = this.owner.connectedActors.get(actorId);
            sock.emit('message', msg);
        }
        else {
            throw new Error("Unable to send message to unknown actor (socket handler)");
        }
    }
}
exports.SocketHandler = SocketHandler;
class ServerSocketManager extends commMedium_1.CommMedium {
    constructor(ip, socketPort) {
        super();
        this.socketIp = ip;
        this.socketPort = socketPort;
        this.socket = io(socketPort);
        this.connectedClients = new Map();
    }
    init(messageHandler) {
        super.init(messageHandler);
        this.socketHandler.messageHandler = messageHandler;
        this.socket.on('connection', (client) => {
            client.on('message', (data) => {
                messageHandler.dispatch(data, [], client);
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
//# sourceMappingURL=sockets.js.map