import {Signal} from "./signal";
import {CommMedium} from "../commMedium";
import {ExternalSignalChangeMessage} from "../messages";
import {FarReference} from "../farRef";
/**
 * Created by flo on 22/06/2017.
 */
export class SignalPool{
    signals             : Map<string,Signal>
    commMedium          : CommMedium
    thisRef             : FarReference

    constructor(commMedium : CommMedium,thisRef : FarReference){
        this.commMedium         = commMedium
        this.thisRef            = thisRef
        this.signals            = new Map()
    }

    newSignal(signal : Signal){
        this.signals.set(signal.id,signal)
    }

    registerExternalListener(signalId : string,holderId : string){
        let signal = this.signals.get(signalId)
        signal.registerListener(()=>{
            this.commMedium.sendMessage(holderId,new ExternalSignalChangeMessage(this.thisRef,signal.id,signal.currentVal))
        })
    }

    getSignal(signalId : string) : Signal{
        return this.signals.get(signalId)
    }
}