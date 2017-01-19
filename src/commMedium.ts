import {MessageHandler} from "./messageHandler";
import {Message} from "./messages";
import {FarReference} from "./farRef";
import {PromisePool} from "./PromisePool";
/**
 * Created by flo on 17/01/2017.
 */
export abstract class CommMedium{
    abstract init(messageHandler : MessageHandler)
    abstract sendMessage(actorId : string,message : Message)
    abstract hasConnection(actorId : string)
    abstract connectRemote(sender : FarReference,address : string,port : number,promisePool : PromisePool) : Promise<any>
    abstract resolvePendingConnection(actorId : string,connectionId : number)
}