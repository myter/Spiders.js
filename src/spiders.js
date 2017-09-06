Object.defineProperty(exports, "__esModule", { value: true });
const sockets_1 = require("./sockets");
const messageHandler_1 = require("./messageHandler");
const farRef_1 = require("./farRef");
const PromisePool_1 = require("./PromisePool");
const objectPool_1 = require("./objectPool");
const serialisation_1 = require("./serialisation");
const ChannelManager_1 = require("./ChannelManager");
const messages_1 = require("./messages");
const GSP_1 = require("./Replication/GSP");
const Repliq_1 = require("./Replication/Repliq");
const RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
const RepliqField_1 = require("./Replication/RepliqField");
const RepliqObjectField_1 = require("./Replication/RepliqObjectField");
const signal_1 = require("./Reactivivity/signal");
const signalPool_1 = require("./Reactivivity/signalPool");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
class Isolate {
    constructor() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
    }
}
exports.Isolate = Isolate;
class ArrayIsolate {
    constructor(array) {
        this[serialisation_1.ArrayIsolateContainer.checkArrayIsolateFuncKey] = true;
        this.array = array;
        for (var i = 0; i < array.length; i++) {
            this[i] = array[i];
        }
    }
    forEach(callback) {
        return this.array.forEach(callback);
    }
    filter(callback) {
        return this.array.filter(callback);
    }
}
exports.ArrayIsolate = ArrayIsolate;
function updateExistingChannels(mainRef, existingActors, newActorId) {
    var mappings = [[], []];
    existingActors.forEach((actorPair) => {
        var workerId = actorPair[0];
        var worker = actorPair[1];
        var channel = new MessageChannel();
        worker.postMessage(JSON.stringify(new messages_1.OpenPortMessage(mainRef, newActorId)), [channel.port1]);
        mappings[0].push(workerId);
        mappings[1].push(channel.port2);
    });
    return mappings;
}
class Actor {
}
class ClientActor extends Actor {
    spawn(app, thisClass) {
        var actorId = utils.generateId();
        var channelMappings = updateExistingChannels(app.mainRef, app.spawnedActors, actorId);
        var work = require('webworkify');
        var webWorker = work(require('./actorProto'));
        webWorker.addEventListener('message', (event) => {
            app.mainMessageHandler.dispatch(event);
        });
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], app.mainRef, actorId, app.channelManager, app.mainPromisePool, app.mainObjectPool);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, app.mainRef, actorId, app.channelManager, app.mainPromisePool, app.mainObjectPool, []);
        var mainChannel = new MessageChannel();
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels = [mainChannel.port1].concat(channelMappings[1]);
        var installMessage = new messages_1.InstallBehaviourMessage(app.mainRef, app.mainId, actorId, actorVariables, actorMethods, staticProperties, channelMappings[0]);
        webWorker.postMessage(JSON.stringify(installMessage), newActorChannels);
        var channelManager = app.mainCommMedium;
        channelManager.newConnection(actorId, mainChannel.port2);
        var ref = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainId, app.mainRef, app.channelManager, app.mainPromisePool, app.mainObjectPool);
        app.spawnedActors.push([actorId, webWorker]);
        return ref.proxyify();
    }
}
class ServerActor extends Actor {
    spawn(app, port, thisClass) {
        var socketManager = app.mainCommMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool, []);
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor = fork(__dirname + '/actorProto.js', [false, app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods), JSON.stringify(staticProperties)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainRef, app.mainCommMedium, app.mainPromisePool, app.mainObjectPool);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    }
    static spawnFromFile(app, port, filePath, actorClassName, constructorArgs) {
        var socketManager = app.mainCommMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils.generateId();
        let serialisedArgs = [];
        constructorArgs.forEach((constructorArg) => {
            serialisedArgs.push(serialisation_1.serialise(constructorArg, app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool));
        });
        var actor = fork(__dirname + '/actorProto.js', [true, app.mainIp, port, actorId, app.mainId, app.mainPort, filePath, actorClassName, JSON.stringify(serialisedArgs)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainRef, app.mainCommMedium, app.mainPromisePool, app.mainObjectPool);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    }
}
class Application {
    constructor() {
        this.appActors = 0;
        if (this.appActors == 0) {
            this.mainId = utils.generateId();
            this.mainPromisePool = new PromisePool_1.PromisePool();
            this.mainObjectPool = new objectPool_1.ObjectPool(this);
        }
        else {
            throw new Error("Cannot create more than one application actor");
        }
    }
}
class ServerApplication extends Application {
    constructor(mainIp = "127.0.0.1", mainPort = 8000) {
        super();
        this.mainIp = mainIp;
        this.mainPort = mainPort;
        this.portCounter = 8001;
        this.spawnedActors = [];
        this.mainCommMedium = new sockets_1.ServerSocketManager(mainIp, mainPort);
        this.socketManager = this.mainCommMedium;
        this.mainRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, this.mainId, this.mainIp, this.mainPort, null, this.mainCommMedium, this.mainPromisePool, this.mainObjectPool);
        this.mainSignalPool = new signalPool_1.SignalPool(this.mainCommMedium, this.mainRef, this.mainPromisePool, this.mainObjectPool);
        this.gspInstance = new GSP_1.GSP(this.socketManager, this.mainId, this.mainRef);
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.socketManager, this.mainPromisePool, this.mainObjectPool, this.gspInstance, this.mainSignalPool);
        this.socketManager.init(this.mainMessageHandler);
        utils.installSTDLib(true, this.mainRef, null, this, this.mainCommMedium, this.mainPromisePool, this.gspInstance, this.mainSignalPool);
    }
    spawnActor(actorClass, constructorArgs = [], port = -1) {
        var actorObject = new actorClass(...constructorArgs);
        if (port == -1) {
            port = this.portCounter++;
        }
        return actorObject.spawn(this, port, actorClass);
    }
    spawnActorFromFile(path, className, constructorArgs = [], port = -1) {
        if (port == -1) {
            port = this.portCounter++;
        }
        return ServerActor.spawnFromFile(this, port, path, className, constructorArgs);
    }
    kill() {
        this.socketManager.closeAll();
        this.spawnedActors.forEach((actor) => {
            actor.kill();
        });
    }
}
class ClientApplication extends Application {
    constructor() {
        super();
        this.mainCommMedium = new ChannelManager_1.ChannelManager();
        this.spawnedActors = [];
        this.channelManager = this.mainCommMedium;
        this.mainRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, this.mainId, this.mainId, null, this.mainCommMedium, this.mainPromisePool, this.mainObjectPool);
        this.gspInstance = new GSP_1.GSP(this.channelManager, this.mainId, this.mainRef);
        this.mainSignalPool = new signalPool_1.SignalPool(this.channelManager, this.mainRef, this.mainPromisePool, this.mainObjectPool);
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.channelManager, this.mainPromisePool, this.mainObjectPool, this.gspInstance, this.mainSignalPool);
        this.channelManager.init(this.mainMessageHandler);
        utils.installSTDLib(true, this.mainRef, null, this, this.mainCommMedium, this.mainPromisePool, this.gspInstance);
    }
    spawnActor(actorClass, constructorArgs = []) {
        var actorObject = new actorClass(...constructorArgs);
        return actorObject.spawn(this, actorClass);
    }
    kill() {
        this.spawnedActors.forEach((workerPair) => {
            workerPair[1].terminate();
            URL.revokeObjectURL(workerPair[1]);
        });
        this.spawnedActors = [];
    }
}
exports.Repliq = Repliq_1.Repliq;
exports.Signal = signal_1.SignalObject;
exports.mutator = signal_1.mutator;
exports.atomic = Repliq_1.atomic;
exports.lease = signal_1.lease;
exports.strong = signal_1.strong;
exports.weak = signal_1.weak;
exports.LWR = RepliqPrimitiveField_1.LWR;
exports.Count = RepliqPrimitiveField_1.Count;
exports.RepliqPrimitiveField = RepliqPrimitiveField_1.RepliqPrimitiveField;
exports.RepliqObjectField = RepliqObjectField_1.RepliqObjectField;
exports.makeAnnotation = RepliqPrimitiveField_1.makeAnnotation;
exports.FieldUpdate = RepliqField_1.FieldUpdate;
exports.Isolate = Isolate;
if (utils.isBrowser()) {
    exports.Application = ClientApplication;
    exports.Actor = ClientActor;
}
else {
    exports.Application = ServerApplication;
    exports.Actor = ServerActor;
}
//# sourceMappingURL=spiders.js.map