Object.defineProperty(exports, "__esModule", { value: true });
const messageHandler_1 = require("./messageHandler");
const FarRef_1 = require("./FarRef");
const ObjectPool_1 = require("./ObjectPool");
const serialisation_1 = require("./serialisation");
const Message_1 = require("./Message");
const Repliq_1 = require("./Replication/Repliq");
const RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
const RepliqField_1 = require("./Replication/RepliqField");
const RepliqObjectField_1 = require("./Replication/RepliqObjectField");
const signal_1 = require("./Reactivivity/signal");
const ActorEnvironment_1 = require("./ActorEnvironment");
const utils_1 = require("./utils");
/**
 * Created by flo on 05/12/2016.
 */
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
        worker.postMessage(JSON.stringify(new Message_1.OpenPortMessage(mainRef, newActorId)), [channel.port1]);
        mappings[0].push(workerId);
        mappings[1].push(channel.port2);
    });
    return mappings;
}
class Actor {
}
class ClientActor extends Actor {
    spawn(app, thisClass) {
        var actorId = utils_1.generateId();
        var channelMappings = updateExistingChannels(app.mainEnvironment.thisRef, app.spawnedActors, actorId);
        var work = require('webworkify');
        var webWorker = work(require('./ActorProto'));
        webWorker.addEventListener('message', (event) => {
            app.mainMessageHandler.dispatch(event);
        });
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], actorId, app.mainEnvironment);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, actorId, [], app.mainEnvironment);
        var mainChannel = new MessageChannel();
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels = [mainChannel.port1].concat(channelMappings[1]);
        var installMessage = new Message_1.InstallBehaviourMessage(app.mainEnvironment.thisRef, app.mainId, actorId, actorVariables, actorMethods, staticProperties, channelMappings[0]);
        webWorker.postMessage(JSON.stringify(installMessage), newActorChannels);
        var channelManager = app.mainEnvironment.commMedium;
        channelManager.newConnection(actorId, mainChannel.port2);
        var ref = new FarRef_1.ClientFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainId, app.mainEnvironment);
        app.spawnedActors.push([actorId, webWorker]);
        return ref.proxyify();
    }
}
class ServerActor extends Actor {
    spawn(app, port, thisClass) {
        var socketManager = app.mainEnvironment.commMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils_1.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], actorId, app.mainEnvironment);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, actorId, [], app.mainEnvironment);
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor = fork(__dirname + '/actorProto.js', [false, app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods), JSON.stringify(staticProperties)]);
        app.spawnedActors.push(actor);
        var ref = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainEnvironment);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    }
    static spawnFromFile(app, port, filePath, actorClassName, constructorArgs) {
        var socketManager = app.mainEnvironment.commMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils_1.generateId();
        let serialisedArgs = [];
        constructorArgs.forEach((constructorArg) => {
            serialisedArgs.push(serialisation_1.serialise(constructorArg, actorId, app.mainEnvironment));
        });
        var actor = fork(__dirname + '/actorProto.js', [true, app.mainIp, port, actorId, app.mainId, app.mainPort, filePath, actorClassName, JSON.stringify(serialisedArgs)]);
        app.spawnedActors.push(actor);
        var ref = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainEnvironment);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    }
}
class Application {
    constructor() {
        this.appActors = 0;
        if (this.appActors == 0) {
            this.mainId = utils_1.generateId();
            /*this.mainEnvironment                = new ActorEnvironment()
            this.mainEnvironment.promisePool    = new PromisePool()
            this.mainEnvironment.objectPool     = new ObjectPool(this)*/
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
        this.mainEnvironment = new ActorEnvironment_1.ServerActorEnvironment(this.mainId, mainIp, mainPort);
        this.mainEnvironment.objectPool.installBehaviourObject(this);
        this.portCounter = 8001;
        this.spawnedActors = [];
        this.socketManager = this.mainEnvironment.commMedium;
        let mainMessageHandler = new messageHandler_1.MessageHandler(this.mainEnvironment);
        this.socketManager.init(mainMessageHandler);
        utils_1.installSTDLib(true, null, this, this.mainEnvironment);
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
        this.mainEnvironment = new ActorEnvironment_1.ClientActorEnvironment();
        this.mainEnvironment.initialise(this.mainId, this.mainId, this);
        this.spawnedActors = [];
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainEnvironment);
        this.mainEnvironment.commMedium.init(this.mainMessageHandler);
        utils_1.installSTDLib(true, null, this, this.mainEnvironment);
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
if (utils_1.isBrowser()) {
    exports.Application = ClientApplication;
    exports.Actor = ClientActor;
}
else {
    exports.Application = ServerApplication;
    exports.Actor = ServerActor;
}
//# sourceMappingURL=spiders.js.map