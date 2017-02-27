///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
const messageHandler_1 = require("./messageHandler");
const sockets_1 = require("./sockets");
const objectPool_1 = require("./objectPool");
const farRef_1 = require("./farRef");
const PromisePool_1 = require("./PromisePool");
const serialisation_1 = require("./serialisation");
const ChannelManager_1 = require("./ChannelManager");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
var messageHandler;
var objectPool;
var promisePool;
var parentRef;
var thisId;
if (utils.isBrowser()) {
    //At spawning time the actor's behaviour, id and main id are not known. This information will be extracted from an install message handled by the messageHandler (which will make sure this information is set (e.g. in the objectPool)
    var channelManager = new ChannelManager_1.ChannelManager();
    promisePool = new PromisePool_1.PromisePool();
    objectPool = new objectPool_1.ObjectPool();
    messageHandler = new messageHandler_1.MessageHandler(null, channelManager, promisePool, objectPool);
    channelManager.init(messageHandler);
    module.exports = function (self) {
        self.addEventListener('message', function (ev) {
            //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
            messageHandler.dispatch(JSON.parse(ev.data), ev.ports);
        });
    };
}
else {
    var address = process.argv[2];
    var port = parseInt(process.argv[3]);
    thisId = process.argv[4];
    var parentId = process.argv[5];
    var parentPort = parseInt(process.argv[6]);
    var socketManager = new sockets_1.ServerSocketManager(address, port);
    promisePool = new PromisePool_1.PromisePool();
    objectPool = new objectPool_1.ObjectPool();
    var thisRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, thisId, address, port, null, null, null, null);
    var behaviourObject = serialisation_1.reconstructBehaviour({}, JSON.parse(process.argv[7]), JSON.parse(process.argv[8]), thisRef, promisePool, socketManager, objectPool);
    serialisation_1.reconstructStatic(behaviourObject, JSON.parse(process.argv[9]), thisRef, promisePool, socketManager, objectPool);
    objectPool.installBehaviourObject(behaviourObject);
    messageHandler = new messageHandler_1.MessageHandler(thisRef, socketManager, promisePool, objectPool);
    socketManager.init(messageHandler);
    parentRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, parentId, address, parentPort, thisRef, socketManager, promisePool, objectPool);
    var parentServer = parentRef;
    socketManager.openConnection(parentServer.ownerId, parentServer.ownerAddress, parentServer.ownerPort);
    utils.installSTDLib(false, thisRef, parentRef, behaviourObject, socketManager, promisePool);
}
//# sourceMappingURL=actorProto.js.map