const sockets_1 = require("./sockets");
const messageHandler_1 = require("./messageHandler");
const farRef_1 = require("./farRef");
const PromisePool_1 = require("./PromisePool");
const objectPool_1 = require("./objectPool");
const serialisation_1 = require("./serialisation");
const ChannelManager_1 = require("./ChannelManager");
const messages_1 = require("./messages");
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
function updateChannels(app) {
    var actors = app.spawnedActors;
    for (var i in actors) {
        var workerRef1 = actors[i];
        var worker1Id = workerRef1[0];
        var worker1 = workerRef1[1];
        for (var j in actors) {
            if (i != j) {
                var workerRef2 = actors[j];
                var worker2Id = workerRef2[0];
                var worker2 = workerRef2[1];
                var channel = new MessageChannel();
                worker1.postMessage(JSON.stringify(new messages_1.OpenPortMessage(app.mainRef, worker2Id)), [channel.port1]);
                worker2.postMessage(JSON.stringify(new messages_1.OpenPortMessage(app.mainRef, worker1Id)), [channel.port2]);
            }
        }
    }
}
class ClientActor {
    spawn(app) {
        var actorId = utils.generateId();
        var work = require('webworkify');
        var webWorker = work(require('./actorProto'));
        webWorker.addEventListener('message', (event) => {
            app.mainMessageHandler.dispatch(event);
        });
        var decon = serialisation_1.deconstructBehaviour(this, [], [], app.mainRef, actorId, app.channelManager, app.mainPromisePool, app.mainObjectPool);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var mainChannel = new MessageChannel();
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        webWorker.postMessage(JSON.stringify(new messages_1.InstallBehaviourMessage(app.mainRef, app.mainId, actorId, actorVariables, actorMethods)), [mainChannel.port1]);
        var channelManager = app.mainCommMedium;
        channelManager.newConnection(actorId, mainChannel.port2);
        var ref = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainId, app.mainRef, app.channelManager, app.mainPromisePool, app.mainObjectPool);
        app.spawnedActors.push([actorId, webWorker]);
        updateChannels(app);
        return ref.proxyify();
    }
}
class ServerActor {
    spawn(app, port) {
        var socketManager = app.mainCommMedium;
        var fork = require('child_process').fork;
        var actorId = utils.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, [], [], app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor = fork(__dirname + '/actorProto.js', [app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods)]);
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
        this.spawnedActors = [];
        this.mainCommMedium = new sockets_1.ServerSocketManager(mainIp, mainPort);
        this.socketManager = this.mainCommMedium;
        this.mainRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, this.mainId, this.mainIp, this.mainPort, null, this.mainCommMedium, this.mainPromisePool, this.mainObjectPool);
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.socketManager, this.mainPromisePool, this.mainObjectPool);
        this.socketManager.init(this.mainMessageHandler);
    }
    spawnActor(actorClass, constructorArgs = [], port = 8080) {
        var actorObject = new actorClass(constructorArgs);
        return actorObject.spawn(this, port);
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
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.channelManager, this.mainPromisePool, this.mainObjectPool);
        this.channelManager.init(this.mainMessageHandler);
    }
    spawnActor(actorClass, constructorArgs) {
        var actorObject = new actorClass(constructorArgs);
        return actorObject.spawn(this);
    }
    kill() {
        this.spawnedActors.forEach((workerPair) => {
            URL.revokeObjectURL(workerPair[1]);
        });
        this.spawnedActors = [];
    }
}
if (utils.isBrowser()) {
    exports.Application = ClientApplication;
    exports.Actor = ClientActor;
}
else {
    exports.Application = ServerApplication;
    exports.Actor = ServerActor;
}
//# sourceMappingURL=spiders.js.map