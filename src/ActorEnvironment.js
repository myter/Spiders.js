Object.defineProperty(exports, "__esModule", { value: true });
const FarRef_1 = require("./FarRef");
const ObjectPool_1 = require("./ObjectPool");
const PromisePool_1 = require("./PromisePool");
const signalPool_1 = require("./Reactivivity/signalPool");
const GSP_1 = require("./Replication/GSP");
const Sockets_1 = require("./Sockets");
const ChannelManager_1 = require("./ChannelManager");
class ActorEnvironment {
    constructor() {
        this.thisRef = null;
    }
}
exports.ActorEnvironment = ActorEnvironment;
class ServerActorEnvironment extends ActorEnvironment {
    constructor(actorId, actorAddress, actorPort) {
        super();
        this.thisRef = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, actorId, actorAddress, actorPort, this);
        this.objectPool = new ObjectPool_1.ObjectPool();
        this.commMedium = new Sockets_1.ServerSocketManager(actorAddress, actorPort);
        this.promisePool = new PromisePool_1.PromisePool();
        this.signalPool = new signalPool_1.SignalPool(this);
        this.gspInstance = new GSP_1.GSP(actorId, this);
    }
}
exports.ServerActorEnvironment = ServerActorEnvironment;
//Constructing a client actor environment happens in two phases (first phase at eval of ActorProto, second phase after receiving the intallation message from app actor running in main thread)
class ClientActorEnvironment extends ActorEnvironment {
    constructor() {
        super();
        this.commMedium = new ChannelManager_1.ChannelManager();
        this.promisePool = new PromisePool_1.PromisePool();
        this.objectPool = new ObjectPool_1.ObjectPool();
    }
    initialise(actorId, mainId, behaviourObject) {
        this.thisRef = new FarRef_1.ClientFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, actorId, mainId, this);
        this.gspInstance = new GSP_1.GSP(actorId, this);
        this.objectPool = new ObjectPool_1.ObjectPool(behaviourObject);
        this.signalPool = new signalPool_1.SignalPool(this);
    }
}
exports.ClientActorEnvironment = ClientActorEnvironment;
//# sourceMappingURL=ActorEnvironment.js.map