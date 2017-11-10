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
var commMedium_1 = require("./commMedium");
/**
 * Created by flo on 18/01/2017.
 */
var utils = require("./utils");
var ChannelManager = (function (_super) {
    __extends(ChannelManager, _super);
    function ChannelManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChannelManager.prototype.init = function (messageHandler) {
        _super.prototype.init.call(this, messageHandler);
        this.connections = new Map();
    };
    ChannelManager.prototype.newConnection = function (actorId, channelPort) {
        var _this = this;
        this.connections.set(actorId, channelPort);
        channelPort.onmessage = function (ev) {
            _this.messageHandler.dispatch(JSON.parse(ev.data), ev.ports);
        };
    };
    //Open connection to Node.js instance owning the object to which the far reference refers to
    ChannelManager.prototype.openConnection = function (actorId, actorAddress, actorPort) {
        this.socketHandler.openConnection(actorId, actorAddress, actorPort);
    };
    ChannelManager.prototype.hasConnection = function (actorId) {
        var inChannel = this.connections.has(actorId);
        var connected = this.connectedActors.has(actorId);
        var disconnected = this.socketHandler.disconnectedActors.indexOf(actorId) != -1;
        return inChannel || connected || disconnected;
    };
    ChannelManager.prototype.sendMessage = function (actorId, message, first) {
        if (first === void 0) { first = true; }
        if (this.connections.has(actorId)) {
            this.connections.get(actorId).postMessage(JSON.stringify(message));
        }
        else if (this.connectedActors.has(actorId) || this.socketHandler.disconnectedActors.indexOf(actorId) != -1) {
            this.socketHandler.sendMessage(actorId, message);
        }
        else {
            //Dirty, but it could be that an actor sends a message to the application actor, leading it to spawn a new actor and returning this new reference.
            //Upon receiving this reference the spawning actor immediatly invokes a method on the reference, but hasn't received the open ports message
            if (first) {
                var that = this;
                setTimeout(function () {
                    that.sendMessage(actorId, message, false);
                }, 10);
            }
            else {
                throw new Error("Unable to send message to unknown actor (channel manager): " + actorId + " in : " + this.messageHandler.environment.thisRef.ownerId);
            }
        }
    };
    return ChannelManager;
}(commMedium_1.CommMedium));
exports.ChannelManager = ChannelManager;
