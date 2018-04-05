import {ClientFarReference, FarReference, ServerFarReference} from "./FarRef";
import {ObjectPool} from "./ObjectPool";
import {CommMedium} from "./CommMedium";
import {PromisePool} from "./PromisePool";
import {SignalPool} from "./Reactivivity/signalPool";
import {GSP} from "./Replication/GSP";
import {ServerSocketManager} from "./Sockets";
import {ChannelManager} from "./ChannelManager";
import {MessageHandler} from "./messageHandler";
import {SpiderActorMirror} from "./MAP";
import {getObjectNames, serialise} from "./serialisation";

export abstract class ActorEnvironment{
    public thisRef          : FarReference = null
    public objectPool       : ObjectPool
    public commMedium       : CommMedium
    public promisePool      : PromisePool
    public signalPool       : SignalPool
    public gspInstance      : GSP
    public messageHandler   : MessageHandler
    public actorMirror      : SpiderActorMirror
    public behaviourObject  : object

    constructor(actorMirror : SpiderActorMirror){
        this.messageHandler = new MessageHandler(this)
        this.actorMirror    = actorMirror
        this.objectPool     = new ObjectPool()
        this.promisePool    = new PromisePool()
        this.actorMirror.bindBase(this,serialise)
    }
}

export class ServerActorEnvironment extends ActorEnvironment {
    constructor(actorId : string,actorAddress : string,actorPort : number,actorMirror : SpiderActorMirror){
        super(actorMirror)
        //Object fields and methods will be filled-in once known
        this.thisRef            = new ServerFarReference(ObjectPool._BEH_OBJ_ID,[],[],actorId,actorAddress,actorPort,this)
        this.commMedium         = new ServerSocketManager(actorAddress,actorPort,this)
        this.signalPool         = new SignalPool(this)
        this.gspInstance        = new GSP(actorId,this)
    }
}

//Constructing a client actor environment happens in two phases (first phase at eval of ActorProto, second phase after receiving the intallation message from app actor running in main thread)
export class ClientActorEnvironment extends ActorEnvironment{
    constructor(actorMirror : SpiderActorMirror){
        super(actorMirror)
        this.commMedium          = new ChannelManager(this)
    }

    initialise(actorId,mainId,behaviourObject){
        let [fieldNames,methodNames]    = getObjectNames(behaviourObject,"toString")
        this.behaviourObject            = behaviourObject
        this.thisRef                    = new ClientFarReference(ObjectPool._BEH_OBJ_ID,fieldNames,methodNames,actorId,mainId,this)
        this.gspInstance                = new GSP(actorId,this)
        this.objectPool                 = new ObjectPool(behaviourObject)
        this.signalPool                 = new SignalPool(this)
    }
}