import {ClientFarReference, FarReference, ServerFarReference} from "./FarRef";
import {ObjectPool} from "./ObjectPool";
import {CommMedium} from "./CommMedium";
import {PromisePool} from "./PromisePool";
import {SignalPool} from "./Reactivivity/signalPool";
import {GSP} from "./Replication/GSP";
import {ServerSocketManager} from "./Sockets";
import {ChannelManager} from "./ChannelManager";
import {reconstructBehaviour, reconstructStatic} from "./serialisation";

export abstract class ActorEnvironment{
    public thisRef     : FarReference = null
    public objectPool  : ObjectPool
    public commMedium  : CommMedium
    public promisePool : PromisePool
    public signalPool  : SignalPool
    public gspInstance : GSP
}

export class ServerActorEnvironment extends ActorEnvironment {
    constructor(actorId : string,actorAddress : string,actorPort : number){
        super()
        this.thisRef        = new ServerFarReference(ObjectPool._BEH_OBJ_ID,actorId,actorAddress,actorPort,this)
        this.objectPool     = new ObjectPool()
        this.commMedium     = new ServerSocketManager(actorAddress,actorPort)
        this.promisePool    = new PromisePool()
        this.signalPool     = new SignalPool(this)
        this.gspInstance    = new GSP(actorId,this)
    }
}

//Constructing a client actor environment happens in two phases (first phase at eval of ActorProto, second phase after receiving the intallation message from app actor running in main thread)
export class ClientActorEnvironment extends ActorEnvironment{
    constructor(){
        super()
        this.commMedium          = new ChannelManager()
        this.promisePool         = new PromisePool()
        this.objectPool          = new ObjectPool()
    }

    initialise(actorId,mainId,behaviourObject){
        this.thisRef        = new ClientFarReference(ObjectPool._BEH_OBJ_ID,actorId,mainId,this)
        this.gspInstance    = new GSP(actorId,this)
        this.objectPool     = new ObjectPool(behaviourObject)
        this.signalPool     = new SignalPool(this)
    }
}