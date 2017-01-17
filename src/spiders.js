const sockets_1 = require("./sockets");
const messageHandler_1 = require("./messageHandler");
const farRef_1 = require("./farRef");
const PromisePool_1 = require("./PromisePool");
const objectPool_1 = require("./objectPool");
const serialisation_1 = require("./serialisation");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
var fork = require('child_process').fork;
class ClientActor {
    //TODO will problably also need to return a promise
    constructor(name = "") {
        this.name = name;
        var work = require('webworkify');
        this.webWorker = work(require('./actorProto'));
        this.webWorker.addEventListener('message', (event) => {
            //TODO
        });
        //TODO send behaviour to worker
    }
}
class ServerActor {
    spawn(app, port) {
        var actorId = utils.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, [], [], app.mainRef, actorId, app.mainSocketManager, app.mainPromisePool, app.mainObjectPool);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor = fork(__dirname + '/actorProto.js', [app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, app.mainIp, port, actorId, app.mainRef, app.mainSocketManager, app.mainPromisePool, app.mainObjectPool);
        app.mainSocketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    }
}
class Isolate {
}
exports.Isolate = Isolate;
class Application {
    constructor(mainIp = "127.0.0.1", mainPort = 8000) {
        this.mainIp = mainIp;
        this.mainPort = mainPort;
        this.spawnedActors = [];
        this.mainId = utils.generateId();
        this.mainPromisePool = new PromisePool_1.PromisePool();
        this.mainObjectPool = new objectPool_1.ObjectPool(this);
        this.mainSocketManager = new sockets_1.SocketManager(mainIp, mainPort);
        this.mainRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, this.mainIp, this.mainPort, this.mainId, null, this.mainSocketManager, this.mainPromisePool, this.mainObjectPool);
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.mainSocketManager, this.mainPromisePool, this.mainObjectPool);
        this.mainSocketManager.init(this.mainMessageHandler);
        if (utils.isBrowser()) {
            this.Actor = ClientActor;
        }
        else {
            this.Actor = ServerActor;
        }
    }
    spawnActor(actorClass, constructorArgs = [], port = 8080) {
        var actorObject = new actorClass(constructorArgs);
        return actorObject.spawn(this, port);
    }
    kill() {
        this.mainSocketManager.closeAll();
        this.spawnedActors.forEach((actor) => {
            actor.kill();
        });
    }
}
exports.Application = Application;
//# sourceMappingURL=spiders.js.map