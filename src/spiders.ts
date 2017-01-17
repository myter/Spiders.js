import {SocketManager} from "./sockets";
import {MessageHandler} from "./messageHandler";
import {ServerFarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
import {ObjectPool} from "./objectPool";
import {getObjectVars, getObjectMethods, deconstructBehaviour} from "./serialisation";
import {ChildProcess} from "child_process";
/**
 * Created by flo on 05/12/2016.
 */
var utils                           = require('./utils')
var fork		                    = require('child_process').fork
type Class = { new(...args: any[]): any; };

abstract class ClientActor{
    webWorker
    name : string
    //TODO will problably also need to return a promise
    constructor(name : string = ""){
        this.name       = name
        var work        = require('webworkify')
        this.webWorker  = work(require('./actorProto'))
        this.webWorker.addEventListener('message',(event) => {
            //TODO
        })
        //TODO send behaviour to worker
    }
}

abstract class ServerActor{
    spawn(app : Application,port : number){
        var actorId: string             = utils.generateId()
        var decon                       = deconstructBehaviour(this,[],[],app.mainRef,actorId,app.mainSocketManager,app.mainPromisePool,app.mainObjectPool)
        var actorVariables              = decon[0]
        var actorMethods                = decon[1]
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)])
        app.spawnedActors.push(actor)
        var ref             = new ServerFarReference(ObjectPool._BEH_OBJ_ID,app.mainIp,port,actorId,app.mainRef,app.mainSocketManager,app.mainPromisePool,app.mainObjectPool)
        app.mainSocketManager.openConnection(ref.ownerId,ref.ownerAddress,ref.ownerPort)
        return ref.proxyify()
    }
}

export abstract class Isolate{

}

export abstract class Application{
    mainIp                          : string
    mainPort                        : number
    mainId                          : string
    mainRef                         : ServerFarReference
    mainSocketManager               : SocketManager
    mainMessageHandler              : MessageHandler
    mainPromisePool                 : PromisePool
    mainObjectPool                  : ObjectPool
    spawnedActors                   : Array<ChildProcess>
    Actor

    constructor(mainIp : string = "127.0.0.1",mainPort : number = 8000){
        this.mainIp             = mainIp
        this.mainPort           = mainPort
        this.spawnedActors      = []
        this.mainId             = utils.generateId()
        this.mainPromisePool    = new PromisePool()
        this.mainObjectPool     = new ObjectPool(this)
        this.mainSocketManager  = new SocketManager(mainIp,mainPort)
        this.mainRef            = new ServerFarReference(ObjectPool._BEH_OBJ_ID,this.mainIp,this.mainPort,this.mainId,null,this.mainSocketManager,this.mainPromisePool,this.mainObjectPool)
        this.mainMessageHandler = new MessageHandler(this.mainRef,this.mainSocketManager,this.mainPromisePool,this.mainObjectPool)
        this.mainSocketManager.init(this.mainMessageHandler)
        if(utils.isBrowser()){
            this.Actor      = ClientActor
        }
        else{
            this.Actor      = ServerActor
        }
    }

    spawnActor(actorClass : Class,constructorArgs : Array<any> = [],port : number = 8080){
        var actorObject = new actorClass(constructorArgs)
        return actorObject.spawn(this,port)
    }

    kill(){
        this.mainSocketManager.closeAll()
        this.spawnedActors.forEach((actor : ChildProcess) => {
            actor.kill()
        })
    }
}







