import {MessageHandler} from "./messageHandler";
import {Message} from "./messages";
/**
 * Created by flo on 17/01/2017.
 */
export abstract class CommMedium{
    abstract init(messageHandler : MessageHandler)
    abstract sendMessage(actorId : string,message : Message)
    abstract hasConnection(actorId : string)
}