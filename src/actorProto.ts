///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
import {MessageHandler} from "./messageHandler";
import {ServerSocketManager} from "./sockets";
import {ObjectPool} from "./objectPool";
import {FarReference, ServerFarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
import {deserialise, reconstructBehaviour, reconstructStatic} from "./serialisation";
import {ChannelManager} from "./ChannelManager";
import {GSP} from "./Replication/GSP";
import {SignalPool} from "./Reactivivity/signalPool";
import {ActorEnvironment} from "./ActorEnvironment";
/**
 * Created by flo on 05/12/2016.
 */
var utils           = require('./utils')

var environment     : ActorEnvironment
var messageHandler  : MessageHandler
var parentRef       : FarReference
var thisId          : string


if(utils.isBrowser()){
    module.exports = function (self) {
        //At spawning time the actor's behaviour, id and main id are not known. This information will be extracted from an install message handled by the messageHandler (which will make sure this information is set (e.g. in the objectPool)
        environment                     = new ActorEnvironment()
        environment.commMedium          = new ChannelManager()
        environment.promisePool         = new PromisePool()
        environment.objectPool          = new ObjectPool()
        messageHandler                  = new MessageHandler(environment)
        environment.commMedium.init(messageHandler)
        self.addEventListener('message',function (ev : MessageEvent){
            //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
            messageHandler.dispatch(JSON.parse(ev.data),ev.ports)
        });
    };
}
else{
    var loadFromFile        = JSON.parse(process.argv[2])
    var address : string    = process.argv[3]
    var port : number       = parseInt(process.argv[4])
    thisId                  = process.argv[5]
    var parentId : string   = process.argv[6]
    var parentPort : number = parseInt(process.argv[7])
    environment             = new ActorEnvironment()
    environment.commMedium  = new ServerSocketManager(address,port)
    environment.promisePool = new PromisePool()
    environment.objectPool  = new ObjectPool()
    environment.thisRef     = new ServerFarReference(ObjectPool._BEH_OBJ_ID,thisId,address,port,environment)
    environment.gspInstance = new GSP(thisId,environment)
    environment.signalPool  = new SignalPool(environment)
    var behaviourObject
    if(loadFromFile){
        var filePath        = process.argv[8]
        var className       = process.argv[9]
        var serialisedArgs  = JSON.parse(process.argv[10])
        var constructorArgs = []
        serialisedArgs.forEach((serArg)=>{
            constructorArgs.push(deserialise(serArg,environment))
        })
        var actorClass      = require(filePath)[className]
        behaviourObject     = new actorClass()
    }
    else{
        var variables   = JSON.parse(process.argv[8])
        var methods     = JSON.parse(process.argv[9])
        behaviourObject = reconstructBehaviour({},variables,methods,environment)
        //reconstructStatic(behaviourObject,JSON.parse(process.argv[10]),thisRef,promisePool,socketManager,objectPool,gspInstance)
    }
    environment.objectPool.installBehaviourObject(behaviourObject)
    messageHandler          = new MessageHandler(environment)
    environment.commMedium.init(messageHandler)
    parentRef               = new ServerFarReference(ObjectPool._BEH_OBJ_ID,parentId,address,parentPort,environment)
    var parentServer        = parentRef as ServerFarReference
    environment.commMedium.openConnection(parentServer.ownerId,parentServer.ownerAddress,parentServer.ownerPort)
    utils.installSTDLib(false,parentRef,behaviourObject,environment)
}


