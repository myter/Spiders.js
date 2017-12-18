Object.defineProperty(exports, "__esModule", { value: true });
const messageHandler_1 = require("./messageHandler");
const ObjectPool_1 = require("./ObjectPool");
const FarRef_1 = require("./FarRef");
const serialisation_1 = require("./serialisation");
const ActorEnvironment_1 = require("./ActorEnvironment");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
var environment;
var messageHandler;
var parentRef;
var thisId;
if (utils.isBrowser()) {
    module.exports = function (self) {
        //At spawning time the actor's behaviour, id and main id are not known. This information will be extracted from an install message handled by the messageHandler (which will make sure this information is set (e.g. in the objectPool)
        environment = new ActorEnvironment_1.ClientActorEnvironment();
        messageHandler = new messageHandler_1.MessageHandler(environment);
        environment.commMedium.init(messageHandler);
        self.addEventListener('message', function (ev) {
            //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
            messageHandler.dispatch(JSON.parse(ev.data), ev.ports);
        });
    };
}
else {
    var loadFromFile = JSON.parse(process.argv[2]);
    var address = process.argv[3];
    var port = parseInt(process.argv[4]);
    thisId = process.argv[5];
    var parentId = process.argv[6];
    var parentPort = parseInt(process.argv[7]);
    environment = new ActorEnvironment_1.ServerActorEnvironment(thisId, address, port);
    var behaviourObject;
    if (loadFromFile) {
        var filePath = process.argv[8];
        var className = process.argv[9];
        var serialisedArgs = JSON.parse(process.argv[10]);
        var constructorArgs = [];
        serialisedArgs.forEach((serArg) => {
            constructorArgs.push(serialisation_1.deserialise(serArg, environment));
        });
        var actorClass = require(filePath)[className];
        behaviourObject = new actorClass();
    }
    else {
        var variables = JSON.parse(process.argv[8]);
        var methods = JSON.parse(process.argv[9]);
        behaviourObject = serialisation_1.reconstructBehaviour({}, variables, methods, environment);
        //reconstructStatic(behaviourObject,JSON.parse(process.argv[10]),thisRef,promisePool,socketManager,objectPool,gspInstance)
    }
    environment.objectPool.installBehaviourObject(behaviourObject);
    messageHandler = new messageHandler_1.MessageHandler(environment);
    environment.commMedium.init(messageHandler);
    parentRef = new FarRef_1.ServerFarReference(ObjectPool_1.ObjectPool._BEH_OBJ_ID, parentId, address, parentPort, environment);
    var parentServer = parentRef;
    environment.commMedium.openConnection(parentServer.ownerId, parentServer.ownerAddress, parentServer.ownerPort);
    utils.installSTDLib(false, parentRef, behaviourObject, environment);
}
//# sourceMappingURL=ActorProto.js.map