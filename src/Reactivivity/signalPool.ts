import {Signal} from "./signal";
import {CommMedium} from "../commMedium";
import {ExternalSignalChangeMessage} from "../messages";
import {FarReference} from "../farRef";
import {serialise} from "../serialisation";
import {PromisePool} from "../PromisePool";
import {ObjectPool} from "../objectPool";
/**
 * Created by flo on 22/06/2017.
 */
export class SignalPool{
    signals             : Map<string,Signal>
    sources             : Map<string,Signal>
    commMedium          : CommMedium
    promisePool         : PromisePool
    objectPool          : ObjectPool
    thisRef             : FarReference

    constructor(commMedium : CommMedium,thisRef : FarReference,promisePool : PromisePool,objectPool : ObjectPool){
        this.commMedium         = commMedium
        this.thisRef            = thisRef
        this.signals            = new Map()
        this.sources            = new Map()
    }

    newSource(signal : Signal){
        this.sources.set(signal.id,signal)
        if(signal.rateLowerBound < Infinity){
            this.trackLease(signal.id,signal.rateLowerBound)
        }
    }

    knownSignal(signalId : string) : boolean {
        return this.sources.has(signalId)
    }

    trackLease(signalId : string,bound : number){
        let valBeforeTimeout = this.sources.get(signalId).value
        setTimeout(()=>{
            let valAfterTimeout = this.sources.get(signalId).value
            if(valAfterTimeout == valBeforeTimeout){
                //console.log("Lease should be destroyed yo ! in: " + this.thisRef.ownerId)
            }
            else{
                //console.log("Lease still ok in: " + this.thisRef.ownerId)
                this.trackLease(signalId,bound)
            }
        },bound)
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
            this.commMedium.sendMessage(holderId,new ExternalSignalChangeMessage(this.thisRef,signal.id,serialise(signal.value,this.thisRef,holderId,this.commMedium,this.promisePool,this.objectPool)))
        })
    }

    sourceChanged(signalId : string,val : any){
        //Elm style propagation, signal pool serves as event dispatcher
        this.sources.forEach((sourceSignal : Signal,id : string)=>{
            if(id == signalId){
                sourceSignal.change(val)
            }
            else{
                sourceSignal.change(Signal.NO_CHANGE)
            }
        })
    }
}