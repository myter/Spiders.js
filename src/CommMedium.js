Object.defineProperty(exports, "__esModule", { value: true });
const Sockets_1 = require("./Sockets");
/**
 * Created by flo on 17/01/2017.
 */
class CommMedium {
    constructor(environment) {
        this.environment = environment;
        this.socketHandler = new Sockets_1.SocketHandler(environment.thisRef.ownerId, environment);
    }
    connectRemote(address, port) {
        return this.socketHandler.openVirginConnection(address, port);
    }
}
exports.CommMedium = CommMedium;
//# sourceMappingURL=CommMedium.js.map