import {Signal, SignalDependency} from "./signal";
import {CommMedium} from "../commMedium";
import {ExternalSignalChangeMessage, ExternalSignalDeleteMessage} from "../messages";
import {FarReference} from "../farRef";
import {serialise} from "../serialisation";
import {PromisePool} from "../PromisePool";
import {ObjectPool} from "../objectPool";
/**
 * Created by flo on 22/06/2017.
 */
export class SignalPool{
    signals             : Map<string,Signal>
    garbageSignals      : Map<string,Signal>
    garbageDependencies : Map<string,Array<String>>
    sources             : Map<string,Signal>
    commMedium          : CommMedium
    promisePool         : PromisePool
    objectPool          : ObjectPool
    thisRef             : FarReference
    //Keep track of garbage collected nodes (to
    garbageCollected    : Array<string>

    constructor(commMedium : CommMedium,thisRef : FarReference,promisePool : PromisePool,objectPool : ObjectPool){
        this.commMedium             = commMedium
        this.thisRef                = thisRef
        this.signals                = new Map()
        this.garbageSignals         = new Map()
        this.garbageDependencies    = new Map()
        this.sources                = new Map()
        this.garbageCollected       = new Array()
        this.promisePool            = promisePool
        this.objectPool             = objectPool
    }

    newSource(signal : Signal){
        this.sources.set(signal.id,signal)
        if(signal.rateLowerBound > 0){
            this.trackLease(signal.id,signal.rateLowerBound)
        }
    }

    knownSignal(signalId : string) : boolean {
        return this.sources.has(signalId) || this.signals.has(signalId)
    }

    trackLease(signalId : string,bound : number){
        let signal
        if(this.sources.has(signalId)){
            signal = this.sources.get(signalId)
        }
        else{
            signal = this.signals.get(signalId)
        }
        let clockBefore = signal.clock
        setTimeout(()=>{
            let clockAfter = signal.clock
            if(clockBefore == clockAfter){
                if(!signal.strong){
                    //console.log("Garbage collecting")
                    this.garbageCollect(signal.id)
                }
                else{
                    //console.log("Lease failed but signal is strong so its ok ! ")
                }
            }
            //Node might have been garbage collected while the lease expired (do not renew lease obviously)
            else if(!(this.garbageCollected as any).includes(signalId)){
                this.trackLease(signalId,bound)
            }
        },bound)
    }

    //TODO first propagate garbage collection, then garbage collect the actual node
    //TODO will need to garbage collect the "failure" dependency graph as well !
    //Recursively delete all children of the specified head node
    garbageCollect(headId : string){
        //Node might have been removed by common ancestor
        if(this.signals.has(headId) || this.sources.has(headId)){
            let head
            if(this.sources.has(headId)){
                head = this.sources.get(headId)
            }
            else{
                head = this.signals.get(headId)
            }
            this.initiateGarbagePropagation(head)
            this.deleteSignal(head)
            head.children.forEach((child : Signal)=>{
                this.garbageCollect(child.id)
            })
        }
    }

    //Garbage collect the garbage dependency graph (i.e. signals triggered by garbage collection of "regular" value signals)
    garbageCollectGarbage(headId : string){
        let sig = this.garbageSignals.get(headId)
        this.garbageSignals.delete(headId)
        sig.garbageSignalDependencies.forEach((dependency : SignalDependency)=>{
            dependency.signal.removeGarbageChild(headId)
        })
        sig.garbageChildren.forEach((child : Signal)=>{
            this.garbageCollectGarbage(child.id)
        })
    }

    private initiateGarbagePropagation(signal : Signal){
        if(this.garbageDependencies.has(signal.id)){
            this.garbageDependencies.get(signal.id).forEach((garbageId : string)=>{
                let destroy = this.garbageSignals.get(garbageId).parentGarbageCollected(signal.id)
                if(destroy){
                    this.garbageCollectGarbage(garbageId)

                }
            })
        }
    }

    private deleteSignal(signal){
        this.signals.delete(signal.id)
        this.sources.delete(signal.id)
        this.garbageCollected.push(signal.id)
        signal.signalDependencies.forEach((dependency : SignalDependency)=>{
            dependency.signal.removeChild(signal.id)
        })
        signal.triggerOnDelete()
    }

    newSignal(signal : Signal){
        this.signals.set(signal.id,signal)
        if(signal.rateLowerBound > 0){
            this.trackLease(signal.id,signal.rateLowerBound)
        }
    }

    newGarbageSignal(signal : Signal){
        this.garbageSignals.set(signal.id,signal)
    }

    addGarbageDependency(regularNodeId : string,garbageNodeId : string){
        if(!this.garbageDependencies.has(regularNodeId)){
            this.garbageDependencies.set(regularNodeId,new Array())
        }
        this.garbageDependencies.get(regularNodeId).push(garbageNodeId)
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
        signal.registerOnChangeListener(()=>{
            this.commMedium.sendMessage(holderId,new ExternalSignalChangeMessage(this.thisRef,signal.id,serialise(signal.value,this.thisRef,holderId,this.commMedium,this.promisePool,this.objectPool)))
        })
        signal.registerOnDeleteListener(()=>{
            this.commMedium.sendMessage(holderId,new ExternalSignalDeleteMessage(this.thisRef,signal.id))
        })
    }

    sourceChanged(signalId : string,val : any){
        //Could be that the signal was garbage collected (shouldn't happen given the failure model)
        if(this.knownSignal(signalId)){
            //Elm style propagation, signal pool serves as event dispatcher
            this.sources.forEach((sourceSignal : Signal,id : string)=>{
                if(id == signalId){
                    sourceSignal.clock++
                    sourceSignal.change(val)
                }
                else{
                    sourceSignal.change(Signal.NO_CHANGE)
                }
            })
        }
    }
}