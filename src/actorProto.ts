///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
import {MessageHandler} from "./messageHandler";
import {SocketManager} from "./sockets";
import {ObjectPool} from "./objectPool";
import {FarReference, ServerFarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
import {} from "./serialisation";
import {reconstructObject} from "./serialisation";
/**
 * Created by flo on 05/12/2016.
 */
var utils           = require('./utils')

var messageHandler  : MessageHandler
var socketManager   : SocketManager
var objectPool      : ObjectPool
var promisePool     : PromisePool
var parentRef       : FarReference
var thisId          : string



if(utils.isBrowser()){
    console.log("Spawned browser actor")
    module.exports = function (self) {
        self.addEventListener('message',function (ev){
            //TODO
        });
    };
}
else{
    var address : string    = process.argv[2]
    var port : number       = parseInt(process.argv[3])
    thisId                  = process.argv[4]
    var parentId : string   = process.argv[5]
    var parentPort : number = parseInt(process.argv[6])
    socketManager           = new SocketManager(address,port)
    promisePool             = new PromisePool()
    objectPool              = new ObjectPool()
    var thisRef             = new ServerFarReference(ObjectPool._BEH_OBJ_ID,address,port,thisId,null,null,null,null)
    var behaviourObject     = reconstructObject(JSON.parse(process.argv[7]),JSON.parse(process.argv[8]),thisRef,promisePool,socketManager,objectPool)
    objectPool.installBehaviourObject(behaviourObject)
    messageHandler          = new MessageHandler(thisRef,socketManager,promisePool,objectPool)
    socketManager.init(messageHandler)
    parentRef               = new ServerFarReference(ObjectPool._BEH_OBJ_ID,address,parentPort,parentId,thisRef,socketManager,promisePool,objectPool)
    var parentServer = parentRef as ServerFarReference
    socketManager.openConnection(parentServer.ownerId,parentServer.ownerAddress,parentServer.ownerPort)
    behaviourObject["parent"] = parentRef.proxyify()
    if(Reflect.has(behaviourObject,"init")){
        behaviourObject["init"]()
    }
}
