Object.defineProperty(exports, "__esModule", { value: true });
const CommMedium_1 = require("./CommMedium");
/**
 * Created by flo on 18/01/2017.
 */
class ChannelManager extends CommMedium_1.CommMedium {
    constructor(environment) {
        super(environment);
        this.connections = new Map();
    }
    newConnection(actorId, channelPort) {
        this.connections.set(actorId, channelPort);
        channelPort.onmessage = (ev) => {
            this.environment.messageHandler.dispatch(JSON.parse(ev.data), ev.ports);
        };
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId, actorAddress, actorPort) {
        this.socketHandler.openConnectionTo(actorId, actorAddress, actorPort);
    }
    hasConnection(actorId) {
        var inChannel = this.connections.has(actorId);
        var connected = this.socketHandler.isKnown(actorId);
        return inChannel || connected;
    }
    sendMessage(actorId, message, first = true) {
        if (this.connections.has(actorId)) {
            this.connections.get(actorId).postMessage(JSON.stringify(message));
        }
        else if (this.socketHandler.isKnown(actorId)) {
            this.socketHandler.sendMessage(actorId, message);
        }
        else {
            //Dirty, but it could be that an actor sends a message to the application actor, leading it to spawn a new actor and returning this new reference.
            //Upon receiving this reference the spawning actor immediatly invokes a method on the reference, but hasn't received the open ports message
            if (first) {
                var that = this;
                setTimeout(() => {
                    that.sendMessage(actorId, message, false);
                }, 10);
            }
            else {
                console.log("Error throwing for " + JSON.stringify(message));
                throw new Error("Unable to send message to unknown actor (channel manager): " + actorId + " in : " + this.environment.thisRef.ownerId);
            }
        }
    }
    sendRouteMessage(targetId, routeId, msg) {
        this.socketHandler.routeMessage(targetId, routeId, msg);
    }
}
exports.ChannelManager = ChannelManager;
//# sourceMappingURL=ChannelManager.js.map