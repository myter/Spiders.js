import {FarReference} from "./farRef";
import {ObjectPool} from "./objectPool";
import {CommMedium} from "./commMedium";
import {PromisePool} from "./PromisePool";
import {SignalPool} from "./Reactivivity/signalPool";
import {GSP} from "./Replication/GSP";

export class ActorEnvironment {
    public thisRef     : FarReference = null
    public objectPool  : ObjectPool
    public commMedium  : CommMedium
    public promisePool : PromisePool
    public signalPool  : SignalPool
    public gspInstance : GSP

}