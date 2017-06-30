import {Signal} from "./signal";
import {CommMedium} from "../commMedium";
import {ExternalSignalChangeMessage} from "../messages";
import {FarReference} from "../farRef";
/**
 * Created by flo on 22/06/2017.
 */
export class SignalPool{
    signals             : Map<string,Signal>
    sources             : Map<string,Signal>
    commMedium          : CommMedium
    thisRef             : FarReference

    constructor(commMedium : CommMedium,thisRef : FarReference){
        this.commMedium         = commMedium
        this.thisRef            = thisRef
        this.signals            = new Map()
        this.sources            = new Map()
    }

    newSource(signal : Signal){
        this.sources.set(signal.id,signal)
    }

    newSignal(signal : Signal){
        this.signals.set(signal.id,signal)
    }

    registerExternalListener(signalId : string,holderId : string){
        let signal
        if(this.signals.has(signalId)){
            signal = this.signals.get(signalId)
        }
        else if(this.sources.has(signalId)){
            signal = this.sources.get(signalId)
        }
        else{
            throw new Error("Unable to find signal to register listener")
        }
        signal.registerListener(()=>{
            this.commMedium.sendMessage(holderId,new ExternalSignalChangeMessage(this.thisRef,signal.id,signal.currentVal))
        })
    }

    sourceChanged(signalId : string,val : any){
        //Elm style propagation, signal pool serves as event dispatcher
        this.sources.forEach((sourceSignal : Signal,id : string)=>{
            if(id == signalId){
                sourceSignal.change(val)
            }
            else{
                sourceSignal.change(sourceSignal.currentVal)
            }
        })
    }
}