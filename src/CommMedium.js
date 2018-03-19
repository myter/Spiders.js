Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
const FarRef_1 = require("./FarRef");
const Sockets_1 = require("./Sockets");
/**
 * Created by flo on 17/01/2017.
 */
class CommMedium {
    constructor(environment) {
        this.pendingActors = new Map();
        this.connectedActors = new Map();
        this.pendingConnectionId = 0;
        this.socketHandler = new Sockets_1.SocketHandler(this);
        this.messageHandler = environment.messageHandler;
    }
    //Called whenever a server far reference is passed around between actors.
    //Given that at this point the id of the server is known (in contrast to when "remote" is called, we can simply open up a port to the server and mark the socket as "disconnected" using the actor id
    connectTransientRemote(sender, toServerRef, promisePool) {
        this.connectRemote(sender, toServerRef.ownerAddress, toServerRef.ownerPort, promisePool);
        this.socketHandler.addDisconnected(toServerRef.ownerId);
    }
    connectRemote(sender, address, port, promisePool) {
        var promiseAllocation = promisePool.newPromise();
        var connection = require('socket.io-client')('http://' + address + ":" + port);
        var connectionId = this.pendingConnectionId;
        this.pendingActors.set(connectionId, connection);
        this.pendingConnectionId += 1;
        connection.on('connect', () => {
            let ack = false;
            connection.emit('message', new Message_1.ConnectRemoteMessage(sender, promiseAllocation.promiseId, connectionId), () => {
                ack = true;
            });
            setTimeout(() => {
                if (!ack) {
                    this.connectRemote(sender, address, port, promisePool);
                }
            }, 1000);
        });
        connection.on('message', (data, ack) => {
            ack();
            if (sender instanceof FarRef_1.ServerFarReference) {
                this.messageHandler.dispatch(data);
            }
            else {
                this.messageHandler.dispatch(JSON.parse(data));
            }
        });
        return promiseAllocation.promise;
    }
    resolvePendingConnection(actorId, connectionId) {
        var connection = this.pendingActors.get(connectionId);
        this.socketHandler.removeFromDisconnected(actorId, connection);
        this.connectedActors.set(actorId, connection);
    }
}
exports.CommMedium = CommMedium;
//# sourceMappingURL=CommMedium.js.map