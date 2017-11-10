"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sockets_1 = require("./sockets");
var messageHandler_1 = require("./messageHandler");
var farRef_1 = require("./farRef");
var PromisePool_1 = require("./PromisePool");
var objectPool_1 = require("./objectPool");
var serialisation_1 = require("./serialisation");
var ChannelManager_1 = require("./ChannelManager");
var messages_1 = require("./messages");
var GSP_1 = require("./Replication/GSP");
var Repliq_1 = require("./Replication/Repliq");
var RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
var RepliqField_1 = require("./Replication/RepliqField");
var RepliqObjectField_1 = require("./Replication/RepliqObjectField");
var signal_1 = require("./Reactivivity/signal");
var signalPool_1 = require("./Reactivivity/signalPool");
var ActorEnvironment_1 = require("./ActorEnvironment");
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
        for (var i = 0; i < array.length; i++) {
            this[i] = array[i];
        }
    }
    ArrayIsolate.prototype.forEach = function (callback) {
        return this.array.forEach(callback);
    };
    ArrayIsolate.prototype.filter = function (callback) {
        return this.array.filter(callback);
    };
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
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClientActor.prototype.spawn = function (app, thisClass) {
        var actorId = utils.generateId();
        var channelMappings = updateExistingChannels(app.mainEnvironment.thisRef, app.spawnedActors, actorId);
        var work = require('webworkify');
        var webWorker = work(require('./actorProto'));
        webWorker.addEventListener('message', function (event) {
            app.mainMessageHandler.dispatch(event);
        });
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], actorId, app.mainEnvironment);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, actorId, [], app.mainEnvironment);
        var mainChannel = new MessageChannel();
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels = [mainChannel.port1].concat(channelMappings[1]);
        var installMessage = new messages_1.InstallBehaviourMessage(app.mainEnvironment.thisRef, app.mainId, actorId, actorVariables, actorMethods, staticProperties, channelMappings[0]);
        webWorker.postMessage(JSON.stringify(installMessage), newActorChannels);
        var channelManager = app.mainEnvironment.commMedium;
        channelManager.newConnection(actorId, mainChannel.port2);
        var ref = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainId, app.mainEnvironment);
        app.spawnedActors.push([actorId, webWorker]);
        return ref.proxyify();
    };
    return ClientActor;
}(Actor));
var ServerActor = (function (_super) {
    __extends(ServerActor, _super);
    function ServerActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServerActor.prototype.spawn = function (app, port, thisClass) {
        var socketManager = app.mainEnvironment.commMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], actorId, app.mainEnvironment);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, actorId, [], app.mainEnvironment);
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor = fork(__dirname + '/actorProto.js', [false, app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods), JSON.stringify(staticProperties)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainEnvironment);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    };
    ServerActor.spawnFromFile = function (app, port, filePath, actorClassName, constructorArgs) {
        var socketManager = app.mainEnvironment.commMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils.generateId();
        var serialisedArgs = [];
        constructorArgs.forEach(function (constructorArg) {
            serialisedArgs.push(serialisation_1.serialise(constructorArg, actorId, app.mainEnvironment));
        });
        var actor = fork(__dirname + '/actorProto.js', [true, app.mainIp, port, actorId, app.mainId, app.mainPort, filePath, actorClassName, JSON.stringify(serialisedArgs)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainEnvironment);
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
            this.mainEnvironment = new ActorEnvironment_1.ActorEnvironment();
            this.mainEnvironment.promisePool = new PromisePool_1.PromisePool();
            this.mainEnvironment.objectPool = new objectPool_1.ObjectPool(this);
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
        var _this = _super.call(this) || this;
        _this.mainIp = mainIp;
        _this.mainPort = mainPort;
        _this.portCounter = 8001;
        _this.spawnedActors = [];
        _this.mainEnvironment.commMedium = new sockets_1.ServerSocketManager(mainIp, mainPort);
        _this.socketManager = _this.mainEnvironment.commMedium;
        _this.mainEnvironment.thisRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, _this.mainId, _this.mainIp, _this.mainPort, _this.mainEnvironment);
        _this.mainEnvironment.gspInstance = new GSP_1.GSP(_this.mainId, _this.mainEnvironment);
        _this.mainEnvironment.signalPool = new signalPool_1.SignalPool(_this.mainEnvironment);
        var mainMessageHandler = new messageHandler_1.MessageHandler(_this.mainEnvironment);
        _this.socketManager.init(mainMessageHandler);
        utils.installSTDLib(true, null, _this, _this.mainEnvironment);
        return _this;
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
    ServerApplication.prototype.spawnActorFromFile = function (path, className, constructorArgs, port) {
        if (constructorArgs === void 0) { constructorArgs = []; }
        if (port === void 0) { port = -1; }
        if (port == -1) {
            port = this.portCounter++;
        }
        return ServerActor.spawnFromFile(this, port, path, className, constructorArgs);
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
        var _this = _super.call(this) || this;
        _this.channelManager = new ChannelManager_1.ChannelManager();
        _this.mainEnvironment.commMedium = _this.channelManager;
        _this.spawnedActors = [];
        _this.mainEnvironment.thisRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, _this.mainId, _this.mainId, _this.mainEnvironment);
        _this.mainEnvironment.gspInstance = new GSP_1.GSP(_this.mainId, _this.mainEnvironment);
        _this.mainEnvironment.signalPool = new signalPool_1.SignalPool(_this.mainEnvironment);
        _this.mainMessageHandler = new messageHandler_1.MessageHandler(_this.mainEnvironment);
        _this.channelManager.init(_this.mainMessageHandler);
        utils.installSTDLib(true, null, _this, _this.mainEnvironment);
        return _this;
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
