"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var commMedium_1 = require("./commMedium");
/**
 * Created by flo on 19/12/2016.
 */
var io = require('socket.io');
var SocketHandler = (function () {
    function SocketHandler(owner) {
        this.owner = owner;
        this.disconnectedActors = [];
        this.pendingMessages = new Map();
        this.fuckUpMessage = new Map();
    }
    SocketHandler.prototype.addDisconnected = function (actorId) {
        this.disconnectedActors.push(actorId);
        this.pendingMessages.set(actorId, []);
    };
    SocketHandler.prototype.removeFromDisconnected = function (actorId, connection) {
        var _this = this;
        this.owner.connectedActors.set(actorId, connection);
        this.disconnectedActors = this.disconnectedActors.filter(function (id) {
            id != actorId;
        });
        if (this.pendingMessages.has(actorId)) {
            var messages = this.pendingMessages.get(actorId);
            messages.forEach(function (msg) {
                _this.sendMessage(actorId, msg);
            });
        }
    };
    //Open connection to Node.js instance owning the object to which the far reference refers to
    SocketHandler.prototype.openConnection = function (actorId, actorAddress, actorPort) {
        var that = this;
        var connection = require('socket.io-client')('http://' + actorAddress + ":" + actorPort);
        this.addDisconnected(actorId);
        connection.on('connect', function () {
            that.removeFromDisconnected(actorId, connection);
            //TODO To remove once solution found
            if (that.fuckUpMessage.has(actorId)) {
                that.fuckUpMessage.get(actorId).forEach(function (msg) {
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
    };
    SocketHandler.prototype.sendMessage = function (actorId, msg) {
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
            //TODO TEMP
            if (this.fuckUpMessage.has(actorId)) {
                this.fuckUpMessage.get(actorId).push(msg);
            }
            else {
                var q = [msg];
                this.fuckUpMessage.set(actorId, q);
            }
        }
    };
    return SocketHandler;
}());
exports.SocketHandler = SocketHandler;
var ServerSocketManager = (function (_super) {
    __extends(ServerSocketManager, _super);
    function ServerSocketManager(ip, socketPort) {
        _super.call(this);
        this.socketIp = ip;
        this.socketPort = socketPort;
        this.socket = io(socketPort);
        this.connectedClients = new Map();
    }
    ServerSocketManager.prototype.init = function (messageHandler) {
        _super.prototype.init.call(this, messageHandler);
        this.socketHandler.messageHandler = messageHandler;
        this.socket.on('connection', function (client) {
            client.on('message', function (data) {
                messageHandler.dispatch(data, [], client);
            });
            client.on('close', function () {
                //TODO
            });
        });
    };
    //Open connection to Node.js instance owning the object to which the far reference refers to
    ServerSocketManager.prototype.openConnection = function (actorId, actorAddress, actorPort) {
        this.socketHandler.openConnection(actorId, actorAddress, actorPort);
    };
    ServerSocketManager.prototype.addNewClient = function (actorId, socket) {
        this.connectedClients.set(actorId, socket);
    };
    ServerSocketManager.prototype.sendMessage = function (actorId, msg) {
        if (this.connectedClients.has(actorId)) {
            this.connectedClients.get(actorId).emit('message', JSON.stringify(msg));
        }
        else {
            this.socketHandler.sendMessage(actorId, msg);
        }
    };
    ServerSocketManager.prototype.hasConnection = function (actorId) {
        return (this.socketHandler.disconnectedActors.indexOf(actorId) != -1) || this.connectedActors.has(actorId);
    };
    ServerSocketManager.prototype.closeAll = function () {
        this.socket.close();
        this.connectedActors.forEach(function (sock) {
            sock.close();
        });
    };
    return ServerSocketManager;
}(commMedium_1.CommMedium));
exports.ServerSocketManager = ServerSocketManager;
