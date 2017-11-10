"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("./messages");
var farRef_1 = require("./farRef");
var sockets_1 = require("./sockets");
/**
 * Created by flo on 17/01/2017.
 */
var CommMedium = (function () {
    function CommMedium() {
        this.pendingActors = new Map();
        this.connectedActors = new Map();
        this.pendingConnectionId = 0;
        this.socketHandler = new sockets_1.SocketHandler(this);
    }
    CommMedium.prototype.init = function (messageHandler) {
        this.messageHandler = messageHandler;
    };
    //Called whenever a server far reference is passed around between actors.
    //Given that at this point the id of the server is known (in contrast to when "remote" is called, we can simply open up a port to the server and mark the socket as "disconnected" using the actor id
    CommMedium.prototype.connectTransientRemote = function (sender, toServerRef, promisePool) {
        this.connectRemote(sender, toServerRef.ownerAddress, toServerRef.ownerPort, promisePool);
        this.socketHandler.addDisconnected(toServerRef.ownerId);
    };
    CommMedium.prototype.connectRemote = function (sender, address, port, promisePool) {
        var _this = this;
        var promiseAllocation = promisePool.newPromise();
        var connection = require('socket.io-client')('http://' + address + ":" + port);
        var connectionId = this.pendingConnectionId;
        this.pendingActors.set(connectionId, connection);
        this.pendingConnectionId += 1;
        connection.on('connect', function () {
            connection.emit('message', new messages_1.ConnectRemoteMessage(sender, promiseAllocation.promiseId, connectionId));
        });
        connection.on('message', function (data) {
            if (sender instanceof farRef_1.ServerFarReference) {
                _this.messageHandler.dispatch(data);
            }
            else {
                _this.messageHandler.dispatch(JSON.parse(data));
            }
        });
        return promiseAllocation.promise;
    };
    CommMedium.prototype.resolvePendingConnection = function (actorId, connectionId) {
        var connection = this.pendingActors.get(connectionId);
        this.socketHandler.removeFromDisconnected(actorId, connection);
        this.connectedActors.set(actorId, connection);
    };
    return CommMedium;
}());
exports.CommMedium = CommMedium;
