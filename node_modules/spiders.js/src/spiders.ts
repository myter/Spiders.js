import {ServerSocketManager} from "./Sockets";
import {ServerFarReference, FarReference, ClientFarReference} from "./FarRef";
import {ObjectPool} from "./ObjectPool";
import {
    deconstructBehaviour, deconstructStatic, getObjectNames,
    serialise
} from "./serialisation";
import {ChannelManager} from "./ChannelManager";
import {InstallBehaviourMessage, OpenPortMessage} from "./Message";
import {Repliq, atomic} from "./Replication/Repliq";
import {RepliqPrimitiveField, LWR, Count, makeAnnotation} from "./Replication/RepliqPrimitiveField";
import {FieldUpdate} from "./Replication/RepliqField";
import {RepliqObjectField} from "./Replication/RepliqObjectField";
import {lease, mutator, Signal, SignalObject, strong, weak} from "./Reactivivity/signal";
import {ActorEnvironment, ClientActorEnvironment, ServerActorEnvironment} from "./ActorEnvironment";
import {PubSubTag} from "./PubSub/SubTag";
import {Subscription} from "./PubSub/SubClient";
import {bundleScope, generateId, isBrowser, LexScope} from "./utils";
import {SpiderActorMirror} from "./MAP";
import {SpiderIsolate, SpiderIsolateMirror, SpiderObject, SpiderObjectMirror} from "./MOP";
import {Eventual} from "./Onward/Eventual";
import {CAPActor} from "./Onward/CAPActor";
import {FarRef} from "../index";
/**
 * Created by flo on 05/12/2016.
 */
type ActorClass                  = {new(...args : any[]): Actor}
type SignalObjectClass           = {new(...args : any[]): SignalObject}
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
    parent          : FarReference
    reflectOnActor  : () => SpiderActorMirror
    reflectOnObject : (object : SpiderObject) => SpiderObjectMirror
    remote          : (string,number)=> Promise<FarReference>
    //Pub-sub
    PSClient        : (string?,number?) => null
    PSServer        : (string?,number?) => null
    publish         : (Object,PubSubTag) => null
    subscribe       : (PubSubTag) => Subscription
    newPSTag        : (string) => PubSubTag
    //Replication
    newRepliq       : (RepliqClass,... any) => Object
    //Reactivity
    QPROP           : (ownType : PubSubTag,directParents : Array<PubSubTag>,directChildren : Array<PubSubTag>,defaultValue : any) => Signal
    addDependency   : (fromType : PubSubTag,toType : PubSubTag) => null
    SIDUP           : (ownType : PubSubTag,parents : Array<PubSubTag>, admitterType: PubSubTag,isSink?:boolean) => Signal
    SIDUPAdmitter   : (admitterType : PubSubTag,sources : number,sinks : number,idleListener?:Function,changeListener?:Function,admitListener?:Function) => null
    publishSignal   : (signal) => null
    newSignal       : (signalClass : SignalObjectClass,...  any) => Signal
    lift            : Function
    liftStrong      : Function
    liftWeak        : Function
    liftFailure     : Function
    actorMirror     : SpiderActorMirror

    constructor(actorMirror : SpiderActorMirror = new SpiderActorMirror()){
        this.actorMirror = actorMirror
    }
}

abstract class ClientActor extends Actor{
    spawn(app : ClientApplication,thisClass){
        var actorId                                     = generateId()
        var channelMappings                             = updateExistingChannels(app.mainEnvironment.thisRef,app.spawnedActors,actorId)
        var work                                        = require('webworkify')
        var webWorker                                   = work(require('./ActorProto'))
        webWorker.addEventListener('message',(event) => {
            app.mainEnvironment.messageHandler.dispatch(event)
        })
        var decon                                       = deconstructBehaviour(this,0,[],[],actorId,app.mainEnvironment,"spawn")
        var actorVariables                              = decon[0]
        var actorMethods                                = decon[1]
        var staticProperties                            = deconstructStatic(thisClass,actorId,[],app.mainEnvironment)
        var deconActorMirror                            = deconstructBehaviour(this.actorMirror,0,[],[],actorId,app.mainEnvironment,"toString")
        var actorMirrorVariables                        = deconActorMirror[0]
        var actorMirrorMethods                          = deconActorMirror[1]
        var mainChannel                                 = new MessageChannel()
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels                            = [mainChannel.port1].concat(channelMappings[1])
        var installMessage                              = new InstallBehaviourMessage(app.mainEnvironment.thisRef,app.mainId,actorId,actorVariables,actorMethods,actorMirrorVariables,actorMirrorMethods,staticProperties,channelMappings[0])
        webWorker.postMessage(JSON.stringify(installMessage),newActorChannels)
        var channelManager                              = (app.mainEnvironment.commMedium as ChannelManager)
        channelManager.newConnection(actorId,mainChannel.port2)
        let [fieldNames,methodNames]                    = getObjectNames(this,"spawn")
        var ref                                         = new ClientFarReference(ObjectPool._BEH_OBJ_ID,fieldNames,methodNames,actorId,app.mainId,app.mainEnvironment)
        app.spawnedActors.push([actorId,webWorker])
        return ref.proxyify()
    }
}

abstract class ServerActor extends Actor{

    spawn(app : ServerApplication,port : number,thisClass){
        var socketManager               = app.mainEnvironment.commMedium as ServerSocketManager
        var fork                        = require('child_process').fork
        var actorId: string             = generateId()
        var decon                       = deconstructBehaviour(this,0,[],[],actorId,app.mainEnvironment,"spawn")
        var actorVariables              = decon[0]
        var actorMethods                = decon[1]
        var staticProperties            = deconstructStatic(thisClass,actorId,[],app.mainEnvironment)
        //Uncomment to debug (huray for webstorms)
        //var actor                       = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var deconActorMirror            = deconstructBehaviour(this.actorMirror,0,[],[],actorId,app.mainEnvironment,"toString")
        var actorMirrorVariables        = deconActorMirror[0]
        var actorMirrorMethods          = deconActorMirror[1]
        var actor                       = fork(__dirname + '/actorProto.js',[false,app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods),JSON.stringify(staticProperties),JSON.stringify(actorMirrorVariables),JSON.stringify(actorMirrorMethods)])
        app.spawnedActors.push(actor)
        let [fieldNames,methodNames]    = getObjectNames(this,"spawn")
        var ref                         = new ServerFarReference(ObjectPool._BEH_OBJ_ID,fieldNames,methodNames,actorId,app.mainIp,port,app.mainEnvironment)
        socketManager.openConnection(ref.ownerId,ref.ownerAddress,ref.ownerPort)
        return ref.proxyify()
    }

    static spawnFromFile(app : ServerApplication,port :number,filePath : string,actorClassName : string,constructorArgs : Array<any>){
        var socketManager   = app.mainEnvironment.commMedium as ServerSocketManager
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork            = eval("req" + "uire('child_process')").fork
        var actorId         = generateId()
        let serialisedArgs  = []
        constructorArgs.forEach((constructorArg)=>{
            serialisedArgs.push(serialise(constructorArg,actorId,app.mainEnvironment))
        })
        var actor           = fork(__dirname + '/actorProto.js',[true,app.mainIp,port,actorId,app.mainId,app.mainPort,filePath,actorClassName,JSON.stringify(serialisedArgs)])
        app.spawnedActors.push(actor)
        //Impossible to know the actor's fields and methods at this point
        var ref             = new ServerFarReference(ObjectPool._BEH_OBJ_ID,[],[],actorId,app.mainIp,port,app.mainEnvironment)
        socketManager.openConnection(ref.ownerId,ref.ownerAddress,ref.ownerPort)
        return ref.proxyify()
    }
}

abstract class Application {
    mainId              : string
    mainEnvironment     : ActorEnvironment
    appActors           : number = 0

    constructor(){
        if(this.appActors == 0){
            this.mainId                         = generateId()
        }
        else{
            throw new Error("Cannot create more than one application actor")
        }
    }

    abstract spawnActor(actorClass : ActorClass,constructorArgs? : Array<any>,port? : number) : FarRef
    //Only implemented by ServerApplication
    abstract spawnActorFromFile(path : string,className : string,constructorArgs? : Array<any>,port? : number)
    abstract kill()
}

class ServerApplication extends Application{
    mainIp                          : string
    mainPort                        : number
    portCounter                     : number
    //SpawnedActors is actually of type Array<ChildProcess> but the ChildProcess types gives error for React-Native applications
    spawnedActors                   : Array<any>

    constructor(mainIp : string = "127.0.0.1",mainPort : number = 8000,actorMirror : SpiderActorMirror = new SpiderActorMirror()){
        super()
        this.mainIp                         = mainIp
        this.mainPort                       = mainPort
        this.mainEnvironment                = new ServerActorEnvironment(this.mainId,mainIp,mainPort,actorMirror)
        this.mainEnvironment.objectPool.installBehaviourObject(this)
        this.portCounter                    = 8001
        this.spawnedActors                  = []
        this.mainEnvironment.actorMirror.initialise(true)
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
        (this.mainEnvironment.commMedium as ServerSocketManager).closeAll()
        this.spawnedActors.forEach((actor) => {
            actor.kill()
        })
    }
}

class ClientApplication extends Application{
    spawnedActors       : Array<any>

    constructor(actorMirror : SpiderActorMirror = new SpiderActorMirror()){
        super()
        this.mainEnvironment                = new ClientActorEnvironment(actorMirror);
        (this.mainEnvironment as ClientActorEnvironment).initialise(this.mainId,this.mainId,this)
        this.spawnedActors                  = []
        this.mainEnvironment.actorMirror.initialise(true)
    }

    spawnActor(actorClass ,constructorArgs : Array<any> = []){
        var actorObject = new actorClass(...constructorArgs)
        return actorObject.spawn(this,actorClass)
    }

    spawnActorFromFile(path : string,className : string,constructorArgs : Array<any>,port : number){
        throw new Error("Cannot spawn actor from file in client-side context")
    }

    kill(){
        this.spawnedActors.forEach((workerPair) => {
            workerPair[1].terminate()
            URL.revokeObjectURL(workerPair[1])
        })
        this.spawnedActors = []
    }

}
/*interface AppType {
    spawnActor
    spawnActorFromFile
    kill
    //Provided by standard lib
    reflectOnActor      : () => SpiderActorMirror
    reflectOnObject     : (object : SpiderObject) => SpiderObjectMirror
    remote              : (string,number)=> Promise<FarRef>
    //Pub-sub
    PSClient            : (string?,number?) => null
    PSServer            : (string?,number?) => null
    publish             : (Object,PubSubTag) => null
    subscribe           : (PubSubTag) => Subscription
    newPSTag            : (string)=>PubSubTag
    //Replication
    newRepliq           : (RepliqClass,... any) => Object
    //Reactivity
    QPROP               : (ownType : PubSubTag,directParents : Array<PubSubTag>,directChildren : Array<PubSubTag>,defaultValue : any) => Signal
    addDependency       : (fromType : PubSubTag,toType : PubSubTag) => null
    SIDUP               : (ownType : PubSubTag,parents : Array<PubSubTag>,admitterType : PubSubTag,isSink?:boolean) => Signal
    SIDUPAdmitter       : (admitterType : PubSubTag,sources : number,sinks : number,idleListener?:Function,changeListener?:Function,admitListener?:Function) => null
    publishSignal       : (signal) => null
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
export type RepliqClass                 = {new(...args : any[]): Repliq}
export type RepliqFieldClass            = {new(...args : any[]): RepliqPrimitiveField<any>}
export type RepliqObjectFieldClass      = {new(...args : any[]): RepliqObjectField}
export type SignalClass                 = {new(...args : any[]): Signal}
export type SignalObjectClass           = {new(...args : any[]): SignalObject}
export type SpiderActorMirrorClass      = {new(...args : any[]): SpiderActorMirror}
export type SpiderObjectClass           = {new(...args : any[]): SpiderObject}
export type SpiderIsolateClass          = {new(...args : any[]): SpiderIsolate}
export type SpiderObjectMirrorClass     = {new(...args : any[]): SpiderObjectMirror}
export type SpiderIsolateMirrorClass    = {new(...args : any[]): SpiderIsolateMirror}
export type LexScopeClass               = {new(...args : any[]): LexScope}

export interface SpiderLib{
    Application                 : ApplicationClass
    Actor                       : ActorClass
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
    SpiderActorMirror           : SpiderActorMirrorClass
    SpiderObjectMirror          : SpiderObjectMirrorClass
    SpiderObject                : SpiderObjectClass
    SpiderIsolate               : SpiderIsolateClass
    SpiderIsolateMirror         : SpiderIsolateMirrorClass
    LexScope                    : LexScopeClass
    bundleScope                 : (Function,LexScope) => undefined
}*/

//Ugly, but a far reference has no static interface
/*export type FarRef = any
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
exports.SpiderIsolate               = SpiderIsolate
exports.SpiderObject                = SpiderObject
exports.SpiderObjectMirror          = SpiderObjectMirror
exports.SpiderIsolateMirror         = SpiderIsolateMirror
exports.SpiderActorMirror           = SpiderActorMirror
exports.bundleScope                 = bundleScope
exports.LexScope                    = LexScope*/
interface ActorType{
    new(mirror? : SpiderActorMirror)
}
interface ApplicationType{
    new()
    kill()
    spawnActor(actorClass : Function,constructorArgs? : Array<any>,port? : number)
    spawnActorFromFile(path : string,className : string,constructorArgs? : Array<any>,port? : number)
}
var exportActor : ActorType
var exportApp   : ApplicationType
if(isBrowser()){
    exportApp           = ClientApplication as any
    exportActor         = ClientActor as any
}
else{
    exportApp           = ServerApplication as any
    exportActor         = ServerActor as any
}
export {exportApp as Application}
export {exportActor as Actor}
export {FarRef as FarRef}
export {SpiderIsolate,SpiderObject,SpiderObjectMirror,SpiderIsolateMirror} from "./MOP"
export {SpiderActorMirror} from "./MAP"
export {bundleScope,LexScope} from "./utils"








