"use strict";
/**
 * Created by flo on 05/02/2017.
 */
var io = require('socket.io');
var socket = io(8000);
var clients = new Map();
var games = new Map();
var occupation = new Map();
var Player = (function () {
    function Player(ref, name) {
        this.ref = ref;
        this.name = name;
    }
    return Player;
}());
function newClient(nickName, ref) {
    clients.set(nickName, new Player(ref, nickName));
    games.forEach(function (creator, roomName) {
        ref.emit('message', ["newGameCreated", roomName, creator.name]);
        if (occupation.get(roomName) > 1) {
            ref.emit('message', ["updateRoomInfo", roomName]);
        }
    });
}
function createNewGame(roomName, creatorRef, creatorName) {
    games.set(roomName, new Player(creatorRef, creatorName));
    occupation.set(roomName, 1);
    clients.forEach(function (client) {
        if (client.name != creatorName) {
            client.ref.emit('message', ["newGameCreated", roomName, creatorName]);
        }
    });
}
function playerJoined(roomName, playerName) {
    var otherPlayer = games.get(roomName);
    occupation.set(roomName, occupation.get(roomName) + 1);
    clients.forEach(function (client) {
        if (client.name != playerName && client.name != otherPlayer.name) {
            client.ref.emit('message', ["updateRoomInfo", roomName]);
        }
    });
}
function forwardPlayerJoins(to, playerNick) {
    var player = clients.get(to);
    player.ref.emit('message', ["playerJoins", playerNick]);
}
function forwardGetPortal(to, playerNick) {
    var player = clients.get(to);
    player.ref.emit('message', ["getPortal", playerNick]);
}
function forwardReceivePortal(to, x, y, r, c) {
    var player = clients.get(to);
    player.ref.emit('message', ["receivePortal", x, y, r, c]);
}
function forwardReceiveBall(to, x, y, vx, vy) {
    var player = clients.get(to);
    player.ref.emit('message', ["receiveBall", x, y, vx, vy]);
}
function forwardScoreChange(to, score) {
    var player = clients.get(to);
    player.ref.emit('message', ["scoreChange", score]);
}
function forwardReceivePowerup(to, type) {
    var player = clients.get(to);
    console.log("Fowarding powerup to " + player.name);
    player.ref.emit('message', ["receivePowerup", type]);
}
socket.on('connect', function (client) {
    client.on('message', function (data) {
        switch (data[0]) {
            case "newClient":
                newClient(data[1], client);
                break;
            case "createNewGame":
                createNewGame(data[1], client, data[2]);
                break;
            case "playerJoined":
                playerJoined(data[1], data[2]);
                break;
            case "forwardPlayerJoins":
                forwardPlayerJoins(data[1], data[2]);
                break;
            case "forwardGetPortal":
                forwardGetPortal(data[1], data[2]);
                break;
            case "forwardReceivePortal":
                forwardReceivePortal(data[1], data[2], data[3], data[4], data[5]);
                break;
            case "forwardReceiveBall":
                forwardReceiveBall(data[1], data[2], data[3], data[4], data[5]);
                break;
            case "forwardScoreChange":
                forwardScoreChange(data[1], data[2]);
                break;
            case "forwardReceivePowerup":
                forwardReceivePowerup(data[1], data[2]);
                break;
            default:
                console.log("Server did not understand message : " + data[0]);
        }
    });
});
