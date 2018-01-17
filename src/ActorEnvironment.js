Object.defineProperty(exports, "__esModule", { value: true });
const FarRef_1 = require("./FarRef");
const ObjectPool_1 = require("./ObjectPool");
const PromisePool_1 = require("./PromisePool");
const signalPool_1 = require("./Reactivivity/signalPool");
const GSP_1 = require("./Replication/GSP");
const Sockets_1 = require("./Sockets");
const ChannelManager_1 = require("./ChannelManager");
const messageHandler_1 = require("./messageHandler");
const serialisation_1 = require("./serialisation");
class ActorEnvironment {
    constructor(actorMirror) {
        this.thisRef = null;
        this.messageHandler = new messageHandler_1.MessageHandler(this);
        this.actorMirror = actorMirror;
        this.objectPool = new ObjectPool_1.ObjectPool();
        this.promisePool = new PromisePool_1.PromisePool();
        this.actorMirror.bindBase(this, serialisation_1.serialise);
    }
}
exports.ActorEnvironment = ActorEnvironment;
class ServerActorEnvironment extends ActorEnvironment {
    constructor(actorId, actorAddress, actorPort, actorMirror) {
        super(actorMirror);
        //Object fields and methods will be filled-in once known
        this.thisRef = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, [], [], actorId, actorAddress, actorPort, this);
        this.commMedium = new Sockets_1.ServerSocketManager(actorAddress, actorPort, this);
        this.signalPool = new signalPool_1.SignalPool(this);
        this.gspInstance = new GSP_1.GSP(actorId, this);
    }
}
exports.ServerActorEnvironment = ServerActorEnvironment;
//Constructing a client actor environment happens in two phases (first phase at eval of ActorProto, second phase after receiving the intallation message from app actor running in main thread)
class ClientActorEnvironment extends ActorEnvironment {
    constructor(actorMirror) {
        super(actorMirror);
        this.commMedium = new ChannelManager_1.ChannelManager(this);
    }
    initialise(actorId, mainId, behaviourObject) {
        let [fieldNames, methodNames] = serialisation_1.getObjectNames(behaviourObject, "toString");
        this.behaviourObject = behaviourObject;
        this.thisRef = new FarRef_1.ClientFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, fieldNames, methodNames, actorId, mainId, this);
        this.gspInstance = new GSP_1.GSP(actorId, this);
        this.objectPool = new ObjectPool_1.ObjectPool(behaviourObject);
        this.signalPool = new signalPool_1.SignalPool(this);
    }
}
exports.ClientActorEnvironment = ClientActorEnvironment;
//# sourceMappingURL=ActorEnvironment.js.map