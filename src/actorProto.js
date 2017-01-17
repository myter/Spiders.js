///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
const messageHandler_1 = require("./messageHandler");
const sockets_1 = require("./sockets");
const objectPool_1 = require("./objectPool");
const farRef_1 = require("./farRef");
const PromisePool_1 = require("./PromisePool");
const serialisation_1 = require("./serialisation");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
var messageHandler;
var socketManager;
var objectPool;
var promisePool;
var parentRef;
var thisId;
if (utils.isBrowser()) {
    console.log("Spawned browser actor");
    module.exports = function (self) {
        self.addEventListener('message', function (ev) {
            //TODO
        });
    };
}
else {
    var address = process.argv[2];
    var port = parseInt(process.argv[3]);
    thisId = process.argv[4];
    var parentId = process.argv[5];
    var parentPort = parseInt(process.argv[6]);
    socketManager = new sockets_1.SocketManager(address, port);
    promisePool = new PromisePool_1.PromisePool();
    objectPool = new objectPool_1.ObjectPool();
    var thisRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, address, port, thisId, null, null, null, null);
    var behaviourObject = serialisation_1.reconstructObject(JSON.parse(process.argv[7]), JSON.parse(process.argv[8]), thisRef, promisePool, socketManager, objectPool);
    objectPool.installBehaviourObject(behaviourObject);
    messageHandler = new messageHandler_1.MessageHandler(thisRef, socketManager, promisePool, objectPool);
    socketManager.init(messageHandler);
    parentRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, address, parentPort, parentId, thisRef, socketManager, promisePool, objectPool);
    var parentServer = parentRef;
    socketManager.openConnection(parentServer.ownerId, parentServer.ownerAddress, parentServer.ownerPort);
    behaviourObject["parent"] = parentRef.proxyify();
    if (Reflect.has(behaviourObject, "init")) {
        behaviourObject["init"]();
    }
}
//# sourceMappingURL=actorProto.js.map