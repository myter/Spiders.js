Object.defineProperty(exports, "__esModule", { value: true });
const CommMedium_1 = require("./CommMedium");
const FarRef_1 = require("./FarRef");
const ObjectPool_1 = require("./ObjectPool");
/**
 * Created by flo on 19/12/2016.
 */
//Tracks messages sent to a specific actor
class MessageBuffer {
    constructor() {
        this.clock = 0;
        this.msgs = [];
        //TODO make this configurable
        this.maxSize = 1000;
    }
    addMessage(msg) {
        this.msgs.push({ clockTime: this.clock, msg: msg });
        msg.setClockTime(this.clock);
        this.clock += 1;
        if (this.msgs.length > this.maxSize) {
            this.msgs.splice(0, 1);
        }
    }
    getMessageFrom(msgClockTime) {
        return this.msgs.filter((element) => {
            return element.clockTime > msgClockTime;
        }).map((el) => {
            return el.msg;
        });
    }
    getAllMessages() {
        return this.msgs.map((bufferedMsg) => {
            return bufferedMsg.msg;
        });
    }
    getLastSent() {
        return this.clock;
    }
}
class SocketHandler {
    constructor(thisActorId, environment) {
        this.lastProcessed = new Map();
        this.sockets = new Map();
        this.msgs = new Map();
        this.environment = environment;
        this.messageHandler = environment.messageHandler;
        this.thisActorId = thisActorId;
        this.connections = [];
        this.trying = new Map();
    }
    isKnown(id) {
        return this.sockets.has(id) || this.trying.has(id);
    }
    handleMessage(fromClient, data, ports = [], clientSocket = null) {
        let senderId = data.senderId;
        let handle = () => {
            this.lastProcessed.set(senderId, data.clockTime);
            if (fromClient) {
                this.messageHandler.dispatch(data, ports, clientSocket);
            }
            else {
                this.messageHandler.dispatch(data);
            }
        };
        if (this.lastProcessed.has(senderId)) {
            if (this.lastProcessed.get(senderId) < data.clockTime) {
                handle();
            }
        }
        else {
            handle();
        }
    }
    handleConnection(actorId, connection) {
        if (this.trying.has(actorId)) {
            this.trying.delete(actorId);
        }
        this.sockets.set(actorId, connection);
        if (this.msgs.has(actorId)) {
            this.msgs.get(actorId).getAllMessages().forEach((msg) => {
                connection.emit('message', msg);
            });
        }
    }
    handleReconnect(actorId, connection) {
        connection.emit('sync', this.lastProcessed.get(actorId));
    }
    handleSync(actorId, connection, lastProcessedClock) {
        if (this.msgs.has(actorId)) {
            let buffer = this.msgs.get(actorId);
            if (buffer.getLastSent() > lastProcessedClock) {
                buffer.getMessageFrom(lastProcessedClock).forEach((msg) => {
                    connection.emit('message', msg);
                });
            }
        }
    }
    openIncomingConnection(socketPort) {
        let io = require('socket.io');
        let connection = io(socketPort);
        connection.origins((origin, callback) => {
            //Add security exception for local accesses
            let serverAddress = this.environment.thisRef.ownerAddress;
            if (!(origin.startsWith("http://" + serverAddress)) && serverAddress != "127.0.0.1" && serverAddress != "localhost") {
                return callback('origin not allowed', false);
            }
            callback(null, true);
        });
        connection.on('connection', (clientSocket) => {
            let handshakePerformed = false;
            let clientActorId;
            clientSocket.on('handshake', (clientActorId) => {
                handshakePerformed = true;
                clientActorId = clientActorId;
                this.handleConnection(clientActorId, clientSocket);
                //Connections opened using openVirginConnection require a serverId back
                clientSocket.emit('serverId', this.environment.thisRef.ownerId);
            });
            clientSocket.on('message', (data) => {
                this.handleMessage(true, data, [], clientSocket);
            });
            clientSocket.on('reconnect', () => {
                if (handshakePerformed) {
                    this.handleReconnect(clientActorId, connection);
                }
            });
            clientSocket.on('sync', (lastProcessedClock) => {
                if (handshakePerformed) {
                    this.handleSync(clientActorId, connection, lastProcessedClock);
                }
            });
            clientSocket.on('discover', (clientActorId) => {
                handshakePerformed = true;
                clientActorId = clientActorId;
                this.handleConnection(clientActorId, clientSocket);
                clientSocket.emit('serverId', this.environment.thisRef.ownerId);
            });
        });
        this.connections.push(connection);
    }
    //Open connection to Node.js instance without knowing actor or object to connect to
    openVirginConnection(address, port) {
        let promisePool = this.environment.promisePool;
        let promiseAlloc = promisePool.newPromise();
        var connection = require('socket.io-client')('http://' + address + ":" + port);
        this.connections.push(connection);
        let actorId;
        connection.on('connect', () => {
            connection.emit('handshake', this.thisActorId);
        });
        connection.on('message', (data) => {
            this.handleMessage(false, data);
        });
        connection.on('reconnect', () => {
            this.handleReconnect(actorId, connection);
        });
        connection.on('sync', (lastProcessedClock) => {
            this.handleSync(actorId, connection, lastProcessedClock);
        });
        connection.on('serverId', (serverActorId) => {
            actorId = serverActorId;
            this.handleConnection(serverActorId, connection);
            let farRef = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, [], [], serverActorId, address, port, this.environment);
            promisePool.resolvePromise(promiseAlloc.promiseId, farRef.proxify());
        });
        return promiseAlloc.promise;
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnectionTo(actorId, actorAddress, actorPort) {
        let promisePool = this.environment.promisePool;
        let promiseAlloc = promisePool.newPromise();
        if (!this.isKnown(actorId)) {
            this.trying.set(actorId, true);
            var connection = require('socket.io-client')('http://' + actorAddress + ":" + actorPort);
            this.connections.push(connection);
            connection.on('connect', () => {
                connection.emit('handshake', this.thisActorId);
                this.handleConnection(actorId, connection);
                let farRef = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, [], [], actorId, actorAddress, actorPort, this.environment);
                promisePool.resolvePromise(promiseAlloc.promiseId, farRef.proxify());
            });
            connection.on('message', (data) => {
                this.handleMessage(false, data);
            });
            connection.on('reconnect', () => {
                this.handleReconnect(actorId, connection);
            });
            connection.on('sync', (lastProcessedClock) => {
                this.handleSync(actorId, connection, lastProcessedClock);
            });
        }
        else {
            let farRef = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, [], [], actorId, actorAddress, actorPort, this.environment);
            promisePool.resolvePromise(promiseAlloc.promiseId, farRef.proxify());
        }
        return promiseAlloc.promise;
    }
    sendMessage(actorId, msg) {
        if (!this.msgs.has(actorId)) {
            this.msgs.set(actorId, new MessageBuffer());
        }
        this.msgs.get(actorId).addMessage(msg);
        if (this.sockets.has(actorId)) {
            this.sockets.get(actorId).emit('message', msg);
        }
    }
    routeMessage(targetId, routeId, msg) {
        if (!this.msgs.has(targetId)) {
            this.msgs.set(targetId, new MessageBuffer());
        }
        msg.message.clockTime = this.msgs.get(targetId).clock;
        this.msgs.get(targetId).clock += 1;
        this.sendMessage(routeId, msg);
    }
}
exports.SocketHandler = SocketHandler;
class ServerSocketManager extends CommMedium_1.CommMedium {
    constructor(ip, socketPort, environment) {
        super(environment);
        this.socketHandler.openIncomingConnection(socketPort);
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId, actorAddress, actorPort) {
        this.socketHandler.openConnectionTo(actorId, actorAddress, actorPort);
    }
    sendMessage(actorId, msg) {
        this.socketHandler.sendMessage(actorId, msg);
    }
    sendRouteMessage(targetId, routeId, msg) {
        this.socketHandler.routeMessage(targetId, routeId, msg);
    }
    hasConnection(actorId) {
        return this.socketHandler.isKnown(actorId);
    }
    closeAll() {
        this.socketHandler.connections.forEach((connection) => {
            connection.close();
        });
    }
}
exports.ServerSocketManager = ServerSocketManager;
//# sourceMappingURL=Sockets.js.map