import {CommMedium} from "./commMedium";
import {MessageHandler} from "./messageHandler";
import {Message} from "./messages";
/**
 * Created by flo on 18/01/2017.
 */
export class ChannelManager extends CommMedium{
    init(messageHandler : MessageHandler){
        //TODO
    }

    hasConnection(actorId : string){
        //TODO
    }

    sendMessage(actorId : string,message : Message){
        //TODO
    }
}