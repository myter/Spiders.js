"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 03/02/2017.
 */
var spiders = require("../../../src/spiders");
var graph = require("./graphics");
var PortalIsolate = (function (_super) {
    __extends(PortalIsolate, _super);
    function PortalIsolate(x, y, r, c) {
        var _this = _super.call(this) || this;
        _this.x = x;
        _this.y = y;
        _this.r = r;
        _this.c = c;
        return _this;
    }
    return PortalIsolate;
}(spiders.Isolate));
var SpiderPongClient = (function (_super) {
    __extends(SpiderPongClient, _super);
    function SpiderPongClient(nickName) {
        var _this = _super.call(this) || this;
        _this.nickName = nickName;
        _this.remote("127.0.0.1", 8000).then(function (serverRef) {
            _this.serverRef = serverRef;
            serverRef.newClient(_this.nickName, _this);
        });
        document.getElementById("newRoomButton").onclick = function () {
            var roomName = document.getElementById('roomName').value;
            _this.currentGame = new graph.game(roomName, _this);
            _this.serverRef.createNewGame(roomName, _this, _this.nickName);
            _this.currentGame.start(true);
        };
        return _this;
    }
    SpiderPongClient.prototype.joinGame = function (roomName, gameCreator) {
        var _this = this;
        this.currentGame = new graph.game(roomName, this);
        this.currentGame.setOpponentReference(gameCreator);
        this.serverRef.playerJoined(roomName, this, this.nickName);
        gameCreator.playerJoins(this, this.nickName);
        gameCreator.getPortal().then(function (portal) {
            _this.currentGame.receivePortal(portal);
        });
        this.currentGame.start(false); // false indicates we joined the game and hence don't have the ball
    };
    SpiderPongClient.prototype.newGameCreated = function (roomName, gameCreator) {
        var row = document.getElementById('roomList').insertRow();
        var nameCell = row.insertCell();
        var noPlayersCell = row.insertCell();
        row.id = roomName;
        nameCell.innerHTML = roomName;
        noPlayersCell.innerHTML = "1/2";
        var that = this;
        row.onclick = function () {
            if (noPlayersCell.innerHTML === "1/2") {
                that.joinGame(roomName, gameCreator);
            }
        };
    };
    SpiderPongClient.prototype.playerJoins = function (player, nickName) {
        this.currentGame.setOpponentReference(player);
        this.currentGame.playerJoined(nickName);
    };
    SpiderPongClient.prototype.updateRoomInfo = function (roomName) {
        document.getElementById(roomName).cells[1].innerHTML = "2/2";
    };
    SpiderPongClient.prototype.getPortal = function () {
        var gamePortal = this.currentGame.getPortal();
        return new PortalIsolate(gamePortal.x, gamePortal.y, gamePortal.r, gamePortal.c);
    };
    SpiderPongClient.prototype.receiveBall = function (x, y, vx, vy) {
        this.currentGame.receiveBall({ x: x, y: y, vx: vx, vy: vy });
    };
    SpiderPongClient.prototype.scoreChange = function (score) {
        this.currentGame.receiveOpponentScore(score);
    };
    SpiderPongClient.prototype.receivePowerup = function (type) {
        this.currentGame.receivePowerup(type);
    };
    //Invoked by UI
    SpiderPongClient.prototype.sendBall = function (x, y, vx, vy, ref) {
        ref.receiveBall(x, y, vx, vy);
    };
    //Invoked by UI
    SpiderPongClient.prototype.sendScoreChange = function (score, ref) {
        ref.scoreChange(score);
    };
    //Invoked by UI
    SpiderPongClient.prototype.sendPowerup = function (type, ref) {
        ref.receivePowerup(type);
    };
    return SpiderPongClient;
}(spiders.Application));
window.start = function () {
    var nickName = document.getElementById('nickname').value;
    new SpiderPongClient(nickName);
};
