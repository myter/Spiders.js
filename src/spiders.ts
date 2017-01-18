import {SocketManager} from "./sockets";
import {MessageHandler} from "./messageHandler";
import {ServerFarReference, FarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
import {ObjectPool} from "./objectPool";
import {deconstructBehaviour} from "./serialisation";
import {CommMedium} from "./commMedium";
import {ChildProcess} from "child_process";
/**
 * Created by flo on 05/12/2016.
 */
var utils                           = require('./utils')

type Class = { new(...args: any[]): any; };

export abstract class Isolate{

}

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
    spawn(app : ServerApplication,port : number){
        var socketManager               = app.mainCommMedium as SocketManager
        var fork		                = require('child_process').fork
        var actorId: string             = utils.generateId()
        var decon                       = deconstructBehaviour(this,[],[],app.mainRef,actorId,socketManager,app.mainPromisePool,app.mainObjectPool)
        var actorVariables              = decon[0]
        var actorMethods                = decon[1]
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor                       = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)])
        app.spawnedActors.push(actor)
        var ref                         = new ServerFarReference(ObjectPool._BEH_OBJ_ID,actorId,app.mainIp,port,app.mainRef,app.mainCommMedium,app.mainPromisePool,app.mainObjectPool)
        socketManager.openConnection(ref.ownerId,ref.ownerAddress,ref.ownerPort)
        return ref.proxyify()
    }
}

abstract class Application {
    mainId              : string
    mainMessageHandler  : MessageHandler
    mainPromisePool     : PromisePool
    mainObjectPool      : ObjectPool
    mainCommMedium      : CommMedium
    mainRef             : FarReference
    Actor               : Class

    constructor(){
        this.mainId             = utils.generateId()
        this.mainPromisePool    = new PromisePool()
        this.mainObjectPool     = new ObjectPool(this)
    }
}

abstract class ServerApplication extends Application{
    mainIp                          : string
    mainPort                        : number
    spawnedActors                   : Array<ChildProcess>
    socketManager                   : SocketManager

    constructor(mainIp : string = "127.0.0.1",mainPort : number = 8000){
        super()
        this.mainIp             = mainIp
        this.mainPort           = mainPort
        this.spawnedActors      = []
        this.mainCommMedium     = new SocketManager(mainIp,mainPort)
        this.socketManager      = this.mainCommMedium as SocketManager
        this.mainRef            = new ServerFarReference(ObjectPool._BEH_OBJ_ID,this.mainId,this.mainIp,this.mainPort,null,this.mainCommMedium as SocketManager,this.mainPromisePool,this.mainObjectPool)
        this.mainMessageHandler = new MessageHandler(this.mainRef,this.socketManager,this.mainPromisePool,this.mainObjectPool)
        this.socketManager.init(this.mainMessageHandler)
        this.Actor              = ServerActor as Class
    }

    spawnActor(actorClass : Class,constructorArgs : Array<any> = [],port : number = 8080){
        var actorObject = new actorClass(constructorArgs)
        return actorObject.spawn(this,port)
    }

    kill(){
        this.socketManager.closeAll()
        this.spawnedActors.forEach((actor : ChildProcess) => {
            actor.kill()
        })
    }
}

if(utils.isBrowser()){
    //TODO
}
else{
    exports.Application = ServerApplication
}







