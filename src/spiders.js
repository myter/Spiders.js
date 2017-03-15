"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var sockets_1 = require("./sockets");
var messageHandler_1 = require("./messageHandler");
var farRef_1 = require("./farRef");
var PromisePool_1 = require("./PromisePool");
var objectPool_1 = require("./objectPool");
var serialisation_1 = require("./serialisation");
var ChannelManager_1 = require("./ChannelManager");
var messages_1 = require("./messages");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
var Isolate = (function () {
    function Isolate() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
    }
    return Isolate;
}());
exports.Isolate = Isolate;
var ArrayIsolate = (function () {
    function ArrayIsolate(array) {
        this[serialisation_1.ArrayIsolateContainer.checkArrayIsolateFuncKey] = true;
        this.array = array;
    }
    return ArrayIsolate;
}());
exports.ArrayIsolate = ArrayIsolate;
function updateExistingChannels(mainRef, existingActors, newActorId) {
    var mappings = [[], []];
    existingActors.forEach(function (actorPair) {
        var workerId = actorPair[0];
        var worker = actorPair[1];
        var channel = new MessageChannel();
        worker.postMessage(JSON.stringify(new messages_1.OpenPortMessage(mainRef, newActorId)), [channel.port1]);
        mappings[0].push(workerId);
        mappings[1].push(channel.port2);
    });
    return mappings;
}
var Actor = (function () {
    function Actor() {
    }
    return Actor;
}());
var ClientActor = (function (_super) {
    __extends(ClientActor, _super);
    function ClientActor() {
        _super.apply(this, arguments);
    }
    ClientActor.prototype.spawn = function (app, thisClass) {
        var actorId = utils.generateId();
        var channelMappings = updateExistingChannels(app.mainRef, app.spawnedActors, actorId);
        var work = require('webworkify');
        var webWorker = work(require('./actorProto'));
        webWorker.addEventListener('message', function (event) {
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
    };
    return ClientActor;
}(Actor));
var ServerActor = (function (_super) {
    __extends(ServerActor, _super);
    function ServerActor() {
        _super.apply(this, arguments);
    }
    ServerActor.prototype.spawn = function (app, port, thisClass) {
        var socketManager = app.mainCommMedium;
        var fork = require('child_process').fork;
        var actorId = utils.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool, []);
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor = fork(__dirname + '/actorProto.js', [app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods), JSON.stringify(staticProperties)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainRef, app.mainCommMedium, app.mainPromisePool, app.mainObjectPool);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    };
    return ServerActor;
}(Actor));
var Application = (function () {
    function Application() {
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
    return Application;
}());
var ServerApplication = (function (_super) {
    __extends(ServerApplication, _super);
    function ServerApplication(mainIp, mainPort) {
        if (mainIp === void 0) { mainIp = "127.0.0.1"; }
        if (mainPort === void 0) { mainPort = 8000; }
        _super.call(this);
        this.mainIp = mainIp;
        this.mainPort = mainPort;
        this.portCounter = 8001;
        this.spawnedActors = [];
        this.mainCommMedium = new sockets_1.ServerSocketManager(mainIp, mainPort);
        this.socketManager = this.mainCommMedium;
        this.mainRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, this.mainId, this.mainIp, this.mainPort, null, this.mainCommMedium, this.mainPromisePool, this.mainObjectPool);
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.socketManager, this.mainPromisePool, this.mainObjectPool);
        this.socketManager.init(this.mainMessageHandler);
        utils.installSTDLib(true, this.mainRef, null, this, this.mainMessageHandler, this.mainCommMedium, this.mainPromisePool);
    }
    ServerApplication.prototype.spawnActor = function (actorClass, constructorArgs, port) {
        if (constructorArgs === void 0) { constructorArgs = []; }
        if (port === void 0) { port = -1; }
        var actorObject = new (actorClass.bind.apply(actorClass, [void 0].concat(constructorArgs)))();
        if (port == -1) {
            port = this.portCounter++;
        }
        return actorObject.spawn(this, port, actorClass);
    };
    ServerApplication.prototype.kill = function () {
        this.socketManager.closeAll();
        this.spawnedActors.forEach(function (actor) {
            actor.kill();
        });
    };
    return ServerApplication;
}(Application));
var ClientApplication = (function (_super) {
    __extends(ClientApplication, _super);
    function ClientApplication() {
        _super.call(this);
        this.mainCommMedium = new ChannelManager_1.ChannelManager();
        this.spawnedActors = [];
        this.channelManager = this.mainCommMedium;
        this.mainRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, this.mainId, this.mainId, null, this.mainCommMedium, this.mainPromisePool, this.mainObjectPool);
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.channelManager, this.mainPromisePool, this.mainObjectPool);
        this.channelManager.init(this.mainMessageHandler);
        utils.installSTDLib(true, this.mainRef, null, this, this.mainCommMedium, this.mainPromisePool);
    }
    ClientApplication.prototype.spawnActor = function (actorClass, constructorArgs) {
        if (constructorArgs === void 0) { constructorArgs = []; }
        var actorObject = new (actorClass.bind.apply(actorClass, [void 0].concat(constructorArgs)))();
        return actorObject.spawn(this, actorClass);
    };
    ClientApplication.prototype.kill = function () {
        this.spawnedActors.forEach(function (workerPair) {
            workerPair[1].terminate();
            URL.revokeObjectURL(workerPair[1]);
        });
        this.spawnedActors = [];
    };
    return ClientApplication;
}(Application));
if (utils.isBrowser()) {
    exports.Application = ClientApplication;
    exports.Actor = ClientActor;
}
else {
    exports.Application = ServerApplication;
    exports.Actor = ServerActor;
}
