import {ObjectPool} from "./ObjectPool";
import {FarReference, ServerFarReference} from "./FarRef";
import {deserialise, getObjectNames, reconstructBehaviour} from "./serialisation";
import {ActorEnvironment, ClientActorEnvironment, ServerActorEnvironment} from "./ActorEnvironment";
import {SpiderActorMirror} from "./MAP";
import {ActorSTDLib} from "./ActorSTDLib";
/**
 * Created by flo on 05/12/2016.
 */
var utils           = require('./utils')

var environment     : ActorEnvironment
var parentRef       : FarReference
var thisId          : string


if(utils.isBrowser()){
    module.exports = function (self) {
        //At spawning time the actor's behaviour, id and main id are not known. This information will be extracted from an install message handled by the messageHandler (which will make sure this information is set (e.g. in the objectPool)
        //This also means that the actor mirror is not available yet, actor uses the default mirror until specified otherwise in the install message
        let mirror  = new SpiderActorMirror()
        environment = new ClientActorEnvironment(mirror)
        self.addEventListener('message',function (ev : MessageEvent){
            //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
            environment.messageHandler.dispatch(JSON.parse(ev.data),ev.ports)
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
        let actorMirror     = behaviourObject.actorMirror
        environment         = new ServerActorEnvironment(thisId,address,port,actorMirror)
    }
    else{
        var variables           = JSON.parse(process.argv[8])
        var methods             = JSON.parse(process.argv[9])
        let actorMirrVars       = JSON.parse(process.argv[11])
        let actorMirrMethods    = JSON.parse(process.argv[12])
        let methAnnots          = JSON.parse(process.argv[13])
        let mirrMethAnnots      = JSON.parse(process.argv[14])
        let actorMirror         = reconstructBehaviour({},actorMirrVars,actorMirrMethods,mirrMethAnnots,environment)
        environment             = new ServerActorEnvironment(thisId,address,port,actorMirror)
        behaviourObject         = reconstructBehaviour({},variables,methods,methAnnots,environment)
        //reconstructStatic(behaviourObject,JSON.parse(process.argv[10]),thisRef,promisePool,socketManager,objectPool,gspInstance)
    }
    environment.objectPool.installBehaviourObject(behaviourObject)
    environment.behaviourObject = behaviourObject
    let [fieldNames,methodnames]= getObjectNames(behaviourObject,"toString")
    environment.thisRef         = new ServerFarReference(ObjectPool._BEH_OBJ_ID,fieldNames,methodnames,thisId,address,port,environment)
    parentRef                   = new ServerFarReference(ObjectPool._BEH_OBJ_ID,[],[],parentId,address,parentPort,environment)
    var parentServer            = parentRef as ServerFarReference
    environment.commMedium.openConnection(parentServer.ownerId,parentServer.ownerAddress,parentServer.ownerPort)
    let stdLib                  = new ActorSTDLib(environment)
    environment.actorMirror.initialise(stdLib,false,parentRef)
}


