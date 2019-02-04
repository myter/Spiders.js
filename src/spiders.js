Object.defineProperty(exports, "__esModule", { value: true });
const FarRef_1 = require("./FarRef");
const ObjectPool_1 = require("./ObjectPool");
const serialisation_1 = require("./serialisation");
const Message_1 = require("./Message");
const ActorEnvironment_1 = require("./ActorEnvironment");
const utils_1 = require("./utils");
const MAP_1 = require("./MAP");
const ActorSTDLib_1 = require("./ActorSTDLib");
var work = require('webworkify');
/**
 * Created by flo on 05/12/2016.
 */
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
class ActorBase {
    constructor(actorMirror = new MAP_1.SpiderActorMirror()) {
        this.actorMirror = actorMirror;
    }
}
class ClientActor extends ActorBase {
    constructor(actorMirror = new MAP_1.SpiderActorMirror()) {
        super(actorMirror);
    }
    spawn(app, thisClass) {
        var actorId = utils_1.generateId();
        var channelMappings = updateExistingChannels(app.mainEnvironment.thisRef, app.spawnedActors, actorId);
        var webWorker = work(require('./ActorProto'));
        webWorker.addEventListener('message', (event) => {
            app.mainEnvironment.messageHandler.dispatch(event);
        });
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], [], actorId, app.mainEnvironment, "spawn");
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var actorMethAnnots = decon[2];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, actorId, [], app.mainEnvironment);
        var deconActorMirror = serialisation_1.deconstructBehaviour(this.actorMirror, 0, [], [], [], actorId, app.mainEnvironment, "toString");
        var actorMirrorVariables = deconActorMirror[0];
        var actorMirrorMethods = deconActorMirror[1];
        var actorMirrorMethAnnots = deconActorMirror[2];
        var mainChannel = new MessageChannel();
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels = [mainChannel.port1].concat(channelMappings[1]);
        var installMessage = new Message_1.InstallBehaviourMessage(app.mainEnvironment.thisRef, app.mainId, actorId, actorVariables, actorMethods, actorMethAnnots, actorMirrorVariables, actorMirrorMethods, actorMirrorMethAnnots, staticProperties, channelMappings[0]);
        webWorker.postMessage(JSON.stringify(installMessage), newActorChannels);
        var channelManager = app.mainEnvironment.commMedium;
        channelManager.newConnection(actorId, mainChannel.port2);
        let [fieldNames, methodNames] = serialisation_1.getObjectNames(this, "spawn");
        var ref = new FarRef_1.ClientFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, fieldNames, methodNames, actorId, app.mainId, app.mainEnvironment);
        app.spawnedActors.push([actorId, webWorker]);
        return ref.proxify();
    }
}
class ServerActor extends ActorBase {
    constructor(actorMirror = new MAP_1.SpiderActorMirror()) {
        super(actorMirror);
    }
    spawn(app, port, thisClass) {
        var socketManager = app.mainEnvironment.commMedium;
        var fork = require('child_process').fork;
        var actorId = utils_1.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], [], actorId, app.mainEnvironment, "spawn");
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var actorMethAnnots = decon[2];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, actorId, [], app.mainEnvironment);
        //Uncomment to debug (huray for webstorms)
        //var actor                       = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var deconActorMirror = serialisation_1.deconstructBehaviour(this.actorMirror, 0, [], [], [], actorId, app.mainEnvironment, "toString");
        var actorMirrorVariables = deconActorMirror[0];
        var actorMirrorMethods = deconActorMirror[1];
        var actorMirrMethAnnots = deconActorMirror[2];
        var actor = fork(__dirname + '/ActorProto.js', [false, app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods), JSON.stringify(staticProperties), JSON.stringify(actorMirrorVariables), JSON.stringify(actorMirrorMethods), JSON.stringify(actorMethAnnots), JSON.stringify(actorMirrMethAnnots)]);
        app.spawnedActors.push(actor);
        let [fieldNames, methodNames] = serialisation_1.getObjectNames(this, "spawn");
        var ref = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, fieldNames, methodNames, actorId, app.mainIp, port, app.mainEnvironment);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxify();
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
        var actor = fork(__dirname + '/ActorProto.js', [true, app.mainIp, port, actorId, app.mainId, app.mainPort, filePath, actorClassName, JSON.stringify(serialisedArgs)]);
        app.spawnedActors.push(actor);
        //Impossible to know the actor's fields and methods at this point
        var ref = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, [], [], actorId, app.mainIp, port, app.mainEnvironment);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxify();
    }
}
class ApplicationBase {
    constructor() {
        this.appActors = 0;
        this.self = this;
        if (this.appActors == 0) {
            this.mainId = utils_1.generateId();
        }
        else {
            throw new Error("Cannot create more than one application actor");
        }
    }
}
class ServerApplication extends ApplicationBase {
    constructor(actorMirror = new MAP_1.SpiderActorMirror(), mainIp = "127.0.0.1", mainPort = 8000) {
        super();
        this.mainIp = mainIp;
        this.mainPort = mainPort;
        this.mainEnvironment = new ActorEnvironment_1.ServerActorEnvironment(this.mainId, mainIp, mainPort, actorMirror);
        this.mainEnvironment.objectPool.installBehaviourObject(this);
        this.mainEnvironment.behaviourObject = this;
        this.portCounter = 8001;
        this.spawnedActors = [];
        this.libs = new ActorSTDLib_1.ActorSTDLib(this.mainEnvironment);
        this.mainEnvironment.actorMirror.initialise(this.libs, true);
    }
    spawnActor(actorClass, constructorArgs = [], port = -1) {
        let e = new Error();
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
        this.mainEnvironment.commMedium.closeAll();
        this.spawnedActors.forEach((actor) => {
            actor.kill();
        });
    }
}
class ClientApplication extends ApplicationBase {
    constructor(actorMirror = new MAP_1.SpiderActorMirror()) {
        super();
        this.mainEnvironment = new ActorEnvironment_1.ClientActorEnvironment(actorMirror);
        this.mainEnvironment.initialise(this.mainId, this.mainId, this);
        this.spawnedActors = [];
        this.libs = new ActorSTDLib_1.ActorSTDLib(this.mainEnvironment);
        this.mainEnvironment.actorMirror.initialise(this.libs, true);
    }
    spawnActor(actorClass, constructorArgs = [], port = -1) {
        var actorObject = new actorClass(...constructorArgs);
        return actorObject.spawn(this, actorClass);
    }
    spawnActorFromFile(path, className, constructorArgs = [], port = -1) {
        throw new Error("Cannot spawn actor from file in client-side context");
    }
    kill() {
        this.spawnedActors.forEach((workerPair) => {
            workerPair[1].terminate();
            URL.revokeObjectURL(workerPair[1]);
        });
        this.spawnedActors = [];
    }
}
exports.Actor = (utils_1.isBrowser()) ? ClientActor : ServerActor;
exports.Application = (utils_1.isBrowser()) ? ClientApplication : ServerApplication;
var MOP_1 = require("./MOP");
exports.SpiderIsolate = MOP_1.SpiderIsolate;
exports.SpiderObject = MOP_1.SpiderObject;
exports.SpiderObjectMirror = MOP_1.SpiderObjectMirror;
exports.SpiderIsolateMirror = MOP_1.SpiderIsolateMirror;
var MAP_2 = require("./MAP");
exports.SpiderActorMirror = MAP_2.SpiderActorMirror;
var utils_2 = require("./utils");
exports.bundleScope = utils_2.bundleScope;
exports.LexScope = utils_2.LexScope;
exports.makeMethodAnnotation = utils_2.makeMethodAnnotation;
var SubTag_1 = require("./PubSub/SubTag");
exports.PubSubTag = SubTag_1.PubSubTag;
//# sourceMappingURL=spiders.js.map