import {ServerSocketManager} from "./Sockets";
import {ServerFarReference, FarReference, ClientFarReference} from "./FarRef";
import {ObjectPool} from "./ObjectPool";
import {
    deconstructBehaviour, deconstructStatic, getObjectNames,
    serialise
} from "./serialisation";
import {ChannelManager} from "./ChannelManager";
import {InstallBehaviourMessage, OpenPortMessage} from "./Message";
import {ActorEnvironment, ClientActorEnvironment, ServerActorEnvironment} from "./ActorEnvironment";
import {bundleScope, generateId, isBrowser, LexScope} from "./utils";
import {SpiderActorMirror} from "./MAP";
import {SpiderIsolate, SpiderIsolateMirror, SpiderObject, SpiderObjectMirror} from "./MOP";
import {FarRef} from "../index";
import {ActorSTDLib} from "./ActorSTDLib";
var work                                        = require('webworkify')
/**
 * Created by flo on 05/12/2016.
 */
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

class ActorBase{
    parent          : FarReference
    libs            : ActorSTDLib
    actorMirror     : SpiderActorMirror

    constructor(actorMirror : SpiderActorMirror = new SpiderActorMirror()){
        this.actorMirror = actorMirror
    }
}

class ClientActor extends ActorBase{

    constructor(actorMirror : SpiderActorMirror = new SpiderActorMirror()){
        super(actorMirror)
    }
    spawn(app : ClientApplication,thisClass){
        var actorId                                     = generateId()
        var channelMappings                             = updateExistingChannels(app.mainEnvironment.thisRef,app.spawnedActors,actorId)

        var webWorker                                   = work(require('./ActorProto'))
        webWorker.addEventListener('message',(event) => {
            app.mainEnvironment.messageHandler.dispatch(event)
        })
        var decon                                       = deconstructBehaviour(this,0,[],[],[],actorId,app.mainEnvironment,"spawn")
        var actorVariables                              = decon[0]
        var actorMethods                                = decon[1]
        var actorMethAnnots                             = decon[2]
        var staticProperties                            = deconstructStatic(thisClass,actorId,[],app.mainEnvironment)
        var deconActorMirror                            = deconstructBehaviour(this.actorMirror,0,[],[],[],actorId,app.mainEnvironment,"toString")
        var actorMirrorVariables                        = deconActorMirror[0]
        var actorMirrorMethods                          = deconActorMirror[1]
        var actorMirrorMethAnnots                       = deconActorMirror[2]
        var mainChannel                                 = new MessageChannel()
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels                            = [mainChannel.port1].concat(channelMappings[1])
        var installMessage                              = new InstallBehaviourMessage(app.mainEnvironment.thisRef,app.mainId,actorId,actorVariables,actorMethods,actorMethAnnots,actorMirrorVariables,actorMirrorMethods,actorMirrorMethAnnots,staticProperties,channelMappings[0])
        webWorker.postMessage(JSON.stringify(installMessage),newActorChannels)
        var channelManager                              = (app.mainEnvironment.commMedium as ChannelManager)
        channelManager.newConnection(actorId,mainChannel.port2)
        let [fieldNames,methodNames]                    = getObjectNames(this,"spawn")
        var ref                                         = new ClientFarReference(ObjectPool._BEH_OBJ_ID,fieldNames,methodNames,actorId,app.mainId,app.mainEnvironment)
        app.spawnedActors.push([actorId,webWorker])
        return ref.proxify()
    }
}

class ServerActor extends ActorBase{

    constructor(actorMirror : SpiderActorMirror = new SpiderActorMirror()){
        super(actorMirror)
    }

    spawn(app : ServerApplication,port : number,thisClass){
        var socketManager               = app.mainEnvironment.commMedium as ServerSocketManager
        var fork                        = require('child_process').fork
        var actorId: string             = generateId()
        var decon                       = deconstructBehaviour(this,0,[],[],[],actorId,app.mainEnvironment,"spawn")
        var actorVariables              = decon[0]
        var actorMethods                = decon[1]
        var actorMethAnnots             = decon[2]
        var staticProperties            = deconstructStatic(thisClass,actorId,[],app.mainEnvironment)
        //Uncomment to debug (huray for webstorms)
        //var actor                       = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var deconActorMirror            = deconstructBehaviour(this.actorMirror,0,[],[],[],actorId,app.mainEnvironment,"toString")
        var actorMirrorVariables        = deconActorMirror[0]
        var actorMirrorMethods          = deconActorMirror[1]
        var actorMirrMethAnnots         = deconActorMirror[2]
        var actor                       = fork(__dirname + '/ActorProto.js',[false,app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods),JSON.stringify(staticProperties),JSON.stringify(actorMirrorVariables),JSON.stringify(actorMirrorMethods),JSON.stringify(actorMethAnnots),JSON.stringify(actorMirrMethAnnots)])
        app.spawnedActors.push(actor)
        let [fieldNames,methodNames]    = getObjectNames(this,"spawn")
        var ref                         = new ServerFarReference(ObjectPool._BEH_OBJ_ID,fieldNames,methodNames,actorId,app.mainIp,port,app.mainEnvironment)
        socketManager.openConnection(ref.ownerId,ref.ownerAddress,ref.ownerPort)
        return ref.proxify()
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
        var actor           = fork(__dirname + '/ActorProto.js',[true,app.mainIp,port,actorId,app.mainId,app.mainPort,filePath,actorClassName,JSON.stringify(serialisedArgs)])
        app.spawnedActors.push(actor)
        //Impossible to know the actor's fields and methods at this point
        var ref             = new ServerFarReference(ObjectPool._BEH_OBJ_ID,[],[],actorId,app.mainIp,port,app.mainEnvironment)
        socketManager.openConnection(ref.ownerId,ref.ownerAddress,ref.ownerPort)
        return ref.proxify()
    }
}

abstract class ApplicationBase {
    mainId: string
    mainEnvironment: ActorEnvironment
    appActors: number = 0
    self: any

    constructor() {
        this.self = this
        if (this.appActors == 0) {
            this.mainId = generateId()
        } else {
            throw new Error("Cannot create more than one application actor")
        }
    }

    abstract spawnActor<T>(actorClass, constructorArgs: Array<any>, port: number): FarRef<T>

    abstract spawnActorFromFile<T>(path: string, className: string, constructorArgs: Array<any>, port: number): FarRef<T>

    abstract kill()
}




class ServerApplication extends ApplicationBase{
    mainIp                          : string
    mainPort                        : number
    portCounter                     : number
    //SpawnedActors is actually of type Array<ChildProcess> but the ChildProcess types gives error for React-Native applications
    spawnedActors                   : Array<any>
    libs                            : ActorSTDLib

    constructor(actorMirror : SpiderActorMirror = new SpiderActorMirror(),mainIp : string = "127.0.0.1",mainPort : number = 8000){
        super()
        this.mainIp                             = mainIp
        this.mainPort                           = mainPort
        this.mainEnvironment                    = new ServerActorEnvironment(this.mainId,mainIp,mainPort,actorMirror)
        this.mainEnvironment.objectPool.installBehaviourObject(this)
        this.mainEnvironment.behaviourObject    = this
        this.portCounter                        = 8001
        this.spawnedActors                      = []
        this.libs                               = new ActorSTDLib(this.mainEnvironment)
        this.mainEnvironment.actorMirror.initialise(this.libs,true)
    }

    spawnActor<T>(actorClass ,constructorArgs : Array<any> = [],port : number = -1) : FarRef<T>{
        let e = new Error()
        var actorObject = new actorClass(...constructorArgs)
        if(port == -1){
            port = this.portCounter++
        }
        return actorObject.spawn(this,port,actorClass)
    }

    spawnActorFromFile<T>(path : string,className : string,constructorArgs : Array<any> = [],port : number = -1) : FarRef<T>{
        if(port == -1){
            port = this.portCounter++
        }
        return ServerActor.spawnFromFile(this,port,path,className,constructorArgs) as T
    }

    kill(){
        (this.mainEnvironment.commMedium as ServerSocketManager).closeAll()
        this.spawnedActors.forEach((actor) => {
            actor.kill()
        })
    }
}

class ClientApplication extends ApplicationBase{
    spawnedActors       : Array<any>
    libs                : ActorSTDLib

    constructor(actorMirror : SpiderActorMirror = new SpiderActorMirror()){
        super()
        this.mainEnvironment                = new ClientActorEnvironment(actorMirror);
        (this.mainEnvironment as ClientActorEnvironment).initialise(this.mainId,this.mainId,this)
        this.spawnedActors                  = []
        this.libs                           = new ActorSTDLib(this.mainEnvironment)
        this.mainEnvironment.actorMirror.initialise(this.libs,true)
    }

    spawnActor<T>(actorClass ,constructorArgs : Array<any> = [],port : number = -1) : FarRef<T>{
        var actorObject = new actorClass(...constructorArgs)
        return actorObject.spawn(this,actorClass)
    }

    spawnActorFromFile<T>(path : string,className : string,constructorArgs : Array<any> = [],port : number = -1) : FarRef<T>{
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

interface ActInterface{
    new(actorMirror? : SpiderActorMirror)   : ActInterface
    libs                                    : ActorSTDLib
    parent                                  : FarRef<any>
}
interface AppInterface{
    libs : ActorSTDLib
    spawnActor<T>(actorClass : Function,constructionArgs? : Array<any>,port? : number) : FarRef<T>
    spawnActorFromFile<T>(path : string,className : string,constructorArgs? : Array<any>,port? : number) : FarRef<T>
    kill()
    new(actorMirror? : SpiderActorMirror,address? : string,port? : number) : AppInterface

}
export const Actor       : ActInterface      = (isBrowser()) ? ClientActor as any : ServerActor as any
export const Application : AppInterface      = (isBrowser()) ? ClientApplication as any : ServerApplication as any
export {FarRef as FarRef}
export {SpiderIsolate,SpiderObject,SpiderObjectMirror,SpiderIsolateMirror} from "./MOP"
export {SpiderActorMirror} from "./MAP"
export {bundleScope,LexScope,makeMethodAnnotation} from "./utils"
export {PubSubTag} from "./PubSub/SubTag"









