import {ServerSocketManager} from "./sockets";
import {MessageHandler} from "./messageHandler";
import {ServerFarReference, FarReference, ClientFarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
import {ObjectPool} from "./objectPool";
import {
    deconstructBehaviour, IsolateContainer, ArrayIsolateContainer, deconstructStatic,
    serialise
} from "./serialisation";
import {CommMedium} from "./commMedium";
import {ChildProcess} from "child_process";
import {ChannelManager} from "./ChannelManager";
import {InstallBehaviourMessage, OpenPortMessage} from "./messages";
import {GSP} from "./Replication/GSP";
import {Repliq, atomic} from "./Replication/Repliq";
import {RepliqPrimitiveField, LWR, Count, makeAnnotation} from "./Replication/RepliqPrimitiveField";
import {FieldUpdate} from "./Replication/RepliqField";
import {RepliqObjectField} from "./Replication/RepliqObjectField";
import {lease, mutator, Signal, SignalObject, strong, weak} from "./Reactivivity/signal";
import {SignalPool} from "./Reactivivity/signalPool";
/**
 * Created by flo on 05/12/2016.
 */
var utils         = require('./utils')

export class Isolate{
    constructor(){
        this[IsolateContainer.checkIsolateFuncKey] = true
    }
}

export class ArrayIsolate{
    array : Array<any>
    constructor(array : Array<any>){
        this[ArrayIsolateContainer.checkArrayIsolateFuncKey] = true
        this.array = array
        for(var i = 0;i < array.length;i++){
            this[i] = array[i]
        }
    }

    forEach(callback){
        return this.array.forEach(callback)
    }

    filter(callback){
        return this.array.filter(callback)
    }

    //TODO implement rest
}

function updateExistingChannels(mainRef : FarReference,existingActors : Array<any>,newActorId : string) : Array<any> {
    var mappings = [[],[]]
    existingActors.forEach((actorPair)=> {
        var workerId    = actorPair[0]
        var worker      = actorPair[1]
        var channel     = new MessageChannel()
        worker.postMessage(JSON.stringify(new OpenPortMessage(mainRef,newActorId)),[channel.port1])
        mappings[0].push(workerId)
        mappings[1].push(channel.port2)
    })
    return mappings
}

abstract class Actor{
    parent          : FarRef
    Isolate         : IsolateClass
    ArrayIsolate    : ArrayIsolateClass
    remote          : (string,number)=> Promise<FarRef>
    newRepliq       : (RepliqClass,... any) => Object
    newSignal       : (signalClass : SignalObjectClass,...  any) => Signal
    lift            : Function
    liftStrong      : Function
    liftWeak        : Function
    liftFailure     : Function
}

abstract class ClientActor extends Actor{
    spawn(app : ClientApplication,thisClass){
        var actorId                                     = utils.generateId()
        var channelMappings                             = updateExistingChannels(app.mainRef,app.spawnedActors,actorId)
        var work                                        = require('webworkify')
        var webWorker                                   = work(require('./actorProto'))
        webWorker.addEventListener('message',(event) => {
            app.mainMessageHandler.dispatch(event)
        })
        var decon                                       = deconstructBehaviour(this,0,[],[],app.mainRef,actorId,app.channelManager,app.mainPromisePool,app.mainObjectPool)
        var actorVariables                              = decon[0]
        var actorMethods                                = decon[1]
        var staticProperties                            = deconstructStatic(thisClass,app.mainRef,actorId,app.channelManager,app.mainPromisePool,app.mainObjectPool,[])
        var mainChannel                                 = new MessageChannel()
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels                            = [mainChannel.port1].concat(channelMappings[1])
        var installMessage                              = new InstallBehaviourMessage(app.mainRef,app.mainId,actorId,actorVariables,actorMethods,staticProperties,channelMappings[0])
        webWorker.postMessage(JSON.stringify(installMessage),newActorChannels)
        var channelManager                              = (app.mainCommMedium as ChannelManager)
        channelManager.newConnection(actorId,mainChannel.port2)
        var ref                                         = new ClientFarReference(ObjectPool._BEH_OBJ_ID,actorId,app.mainId,app.mainRef,app.channelManager,app.mainPromisePool,app.mainObjectPool)
        app.spawnedActors.push([actorId,webWorker])
        return ref.proxyify()
    }
}

abstract class ServerActor extends Actor{

    spawn(app : ServerApplication,port : number,thisClass){
        var socketManager               = app.mainCommMedium as ServerSocketManager
        var fork		                = require('child_process').fork
        var actorId: string             = utils.generateId()
        var decon                       = deconstructBehaviour(this,0,[],[],app.mainRef,actorId,socketManager,app.mainPromisePool,app.mainObjectPool)
        var actorVariables              = decon[0]
        var actorMethods                = decon[1]
        var staticProperties            = deconstructStatic(thisClass,app.mainRef,actorId,socketManager,app.mainPromisePool,app.mainObjectPool,[])
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor                       = fork(__dirname + '/actorProto.js',[false,app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods),JSON.stringify(staticProperties)])
        app.spawnedActors.push(actor)
        var ref                         = new ServerFarReference(ObjectPool._BEH_OBJ_ID,actorId,app.mainIp,port,app.mainRef,app.mainCommMedium,app.mainPromisePool,app.mainObjectPool)
        socketManager.openConnection(ref.ownerId,ref.ownerAddress,ref.ownerPort)
        return ref.proxyify()
    }

    static spawnFromFile(app : ServerApplication,port :number,filePath : string,actorClassName : string,constructorArgs : Array<any>){
        var socketManager   = app.mainCommMedium as ServerSocketManager
        var fork            = require('child_process').fork
        var actorId         = utils.generateId()
        let serialisedArgs  = []
        constructorArgs.forEach((constructorArg)=>{
            serialisedArgs.push(serialise(constructorArg,app.mainRef,actorId,socketManager,app.mainPromisePool,app.mainObjectPool))
        })
        var actor           = fork(__dirname + '/actorProto.js',[true,app.mainIp,port,actorId,app.mainId,app.mainPort,filePath,actorClassName,JSON.stringify(serialisedArgs)])
        app.spawnedActors.push(actor)
        var ref             = new ServerFarReference(ObjectPool._BEH_OBJ_ID,actorId,app.mainIp,port,app.mainRef,app.mainCommMedium,app.mainPromisePool,app.mainObjectPool)
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
    mainSignalPool      : SignalPool
    mainRef             : FarReference
    gspInstance         : GSP
    appActors           : number = 0

    constructor(){
        if(this.appActors == 0){
            this.mainId             = utils.generateId()
            this.mainPromisePool    = new PromisePool()
            this.mainObjectPool     = new ObjectPool(this)
        }
        else{
            throw new Error("Cannot create more than one application actor")
        }
    }

    abstract spawnActor(actorClass : ActorClass,constructorArgs? : Array<any>,port? : number) : FarRef
    abstract kill()
}

class ServerApplication extends Application{
    mainIp                          : string
    mainPort                        : number
    portCounter                     : number
    spawnedActors                   : Array<ChildProcess>
    socketManager                   : ServerSocketManager

    constructor(mainIp : string = "127.0.0.1",mainPort : number = 8000){
        super()
        this.mainIp             = mainIp
        this.mainPort           = mainPort
        this.portCounter        = 8001
        this.spawnedActors      = []
        this.mainCommMedium     = new ServerSocketManager(mainIp,mainPort)
        this.socketManager      = this.mainCommMedium as ServerSocketManager
        this.mainRef            = new ServerFarReference(ObjectPool._BEH_OBJ_ID,this.mainId,this.mainIp,this.mainPort,null,this.mainCommMedium as ServerSocketManager,this.mainPromisePool,this.mainObjectPool)
        this.mainSignalPool     = new SignalPool(this.mainCommMedium,this.mainRef,this.mainPromisePool,this.mainObjectPool)
        this.gspInstance        = new GSP(this.socketManager,this.mainId,this.mainRef)
        this.mainMessageHandler = new MessageHandler(this.mainRef,this.socketManager,this.mainPromisePool,this.mainObjectPool,this.gspInstance,this.mainSignalPool)
        this.socketManager.init(this.mainMessageHandler)
        utils.installSTDLib(true,this.mainRef,null,this,this.mainCommMedium,this.mainPromisePool,this.gspInstance,this.mainSignalPool)
    }

    spawnActor(actorClass ,constructorArgs : Array<any> = [],port : number = -1){
        var actorObject = new actorClass(...constructorArgs)
        if(port == -1){
            port = this.portCounter++
        }
        return actorObject.spawn(this,port,actorClass)
    }

    spawnActorFromFile(path : string,className : string,constructorArgs : Array<any> = [],port : number = -1){
        if(port == -1){
            port = this.portCounter++
        }
        return ServerActor.spawnFromFile(this,port,path,className,constructorArgs)
    }

    kill(){
        this.socketManager.closeAll()
        this.spawnedActors.forEach((actor : ChildProcess) => {
            actor.kill()
        })
    }
}

class ClientApplication extends Application{
    channelManager  : ChannelManager
    spawnedActors   : Array<any>


    constructor(){
        super()
        this.mainCommMedium     = new ChannelManager()
        this.spawnedActors      = []
        this.channelManager     = this.mainCommMedium as ChannelManager
        this.mainRef            = new ClientFarReference(ObjectPool._BEH_OBJ_ID,this.mainId,this.mainId,null,this.mainCommMedium as ChannelManager,this.mainPromisePool,this.mainObjectPool)
        this.gspInstance        = new GSP(this.channelManager,this.mainId,this.mainRef)
        this.mainSignalPool     = new SignalPool(this.channelManager,this.mainRef,this.mainPromisePool,this.mainObjectPool)
        this.mainMessageHandler = new MessageHandler(this.mainRef,this.channelManager,this.mainPromisePool,this.mainObjectPool,this.gspInstance,this.mainSignalPool)
        this.channelManager.init(this.mainMessageHandler)
        utils.installSTDLib(true,this.mainRef,null,this,this.mainCommMedium,this.mainPromisePool,this.gspInstance)
    }

    spawnActor(actorClass ,constructorArgs : Array<any> = []){
        var actorObject = new actorClass(...constructorArgs)
        return actorObject.spawn(this,actorClass)
    }

    kill(){
        this.spawnedActors.forEach((workerPair) => {
            workerPair[1].terminate()
            URL.revokeObjectURL(workerPair[1])
        })
        this.spawnedActors = []
    }

}
interface AppType {
    spawnActor
    spawnActorFromFile
    kill
    //Provided by standard lib
    Isolate             : IsolateClass
    ArrayIsolate        : ArrayIsolateClass
    remote              : (string,number)=> Promise<FarRef>
    newRepliq           : (RepliqClass,... any) => Object
    newSignal           : (signalClass : SignalObjectClass,... any) => Signal
    lift                : Function
    liftStrong          : Function
    liftWeak            : Function
    liftFailure         : Function
}
export type ApplicationClass    = {
    new(...args : any[]): AppType
}
export type ActorClass                  = {new(...args : any[]): Actor}
export type IsolateClass                = {new(...args : any[]): Isolate}
export type ArrayIsolateClass           = {new(...args : any[]): ArrayIsolate}
export type RepliqClass                 = {new(...args : any[]): Repliq}
export type RepliqFieldClass            = {new(...args : any[]): RepliqPrimitiveField<any>}
export type RepliqObjectFieldClass      = {new(...args : any[]): RepliqObjectField}
export type SignalClass                 = {new(...args : any[]): Signal}
export type SignalObjectClass           = {new(...args : any[]): SignalObject}


export interface SpiderLib{
    Application                 : ApplicationClass
    Actor                       : ActorClass
    Isolate                     : IsolateClass
    ArrayIsolate                : ArrayIsolateClass
    Repliq                      : RepliqClass
    Signal                      : SignalObjectClass
    mutator                     : Function
    lease                       : Function
    strong                      : Function
    weak                        : Function
    atomic                      : Function
    LWR                         : Function
    Count                       : Function
    RepliqPrimitiveField        : RepliqFieldClass
    RepliqObjectField           : RepliqObjectFieldClass
    FieldUpdate                 : FieldUpdate
    makeAnnotation              : Function
}

//Ugly, but a far reference has no static interface
export type FarRef = any
exports.Repliq                      = Repliq
exports.Signal                      = SignalObject
exports.mutator                     = mutator
exports.atomic                      = atomic
exports.lease                       = lease
exports.strong                      = strong
exports.weak                        = weak
exports.LWR                         = LWR
exports.Count                       = Count
exports.RepliqPrimitiveField        = RepliqPrimitiveField
exports.RepliqObjectField           = RepliqObjectField
exports.makeAnnotation              = makeAnnotation
exports.FieldUpdate                 = FieldUpdate
exports.Isolate                     = Isolate
if(utils.isBrowser()){
    exports.Application = ClientApplication
    exports.Actor       = ClientActor
}
else{
    exports.Application = ServerApplication
    exports.Actor       = ServerActor
}








