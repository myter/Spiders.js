import {Signal, SignalDependency} from "./signal";
import {ExternalSignalDeleteMessage} from "../Message";
import {ActorEnvironment} from "../ActorEnvironment";
import {DPropAlgorithm} from "./DPropAlgorithm";
import {NoGlitchFreedom} from "./NoGlitchFreedom";
import {PropagationValue} from "./QPROP";
import {NodePulse} from "./SIDUP";
/**
 * Created by flo on 22/06/2017.
 */
export class SignalPool{
    signals             : Map<string,Signal>
    garbageSignals      : Map<string,Signal>
    garbageDependencies : Map<string,Array<String>>
    externalHolders     : Map<string,Array<string>>
    sources             : Map<string,Signal>
    environment         : ActorEnvironment
    //Keep track of garbage collected nodes (to
    garbageCollected    : Array<string>
    //Keep track of mutating methods for each class of signal
    mutators            : Map<string,Array<string>>
    //Algorithm used for distributed glitch freedom
    distAlgo            : DPropAlgorithm
    lastPropMessage     : PropagationValue
    lastPulse           : NodePulse

    constructor(actorEnvironment : ActorEnvironment){
        this.environment            = actorEnvironment
        this.signals                = new Map()
        this.garbageSignals         = new Map()
        this.externalHolders        = new Map()
        this.garbageDependencies    = new Map()
        this.sources                = new Map()
        this.garbageCollected       = new Array()
        this.mutators               = new Map()
        this.distAlgo               = new NoGlitchFreedom()
        this.distAlgo.setSignalPool(this)
    }

    installDPropAlgorithm(algoInstance : DPropAlgorithm){
        this.distAlgo = algoInstance
        this.distAlgo.setSignalPool(this)
    }

    setLastPropMessage(propMessage : PropagationValue){
        this.lastPropMessage = propMessage
    }

    setLastPulse(pulse : NodePulse){
        this.lastPulse = pulse
    }

    addMutator(className : string, methodName : string){
        if(!this.mutators.has(className)){
            this.mutators.set(className,[])
        }
        this.mutators.get(className).push(methodName)
    }

    isMutator(className : string, methodName : string){
        return this.mutators.has(className) && (this.mutators.get(className) as any).includes(methodName)
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
        if(this.externalHolders.has(signalId)){
            this.externalHolders.get(signalId).push(holderId)
        }
        else{
            this.externalHolders.set(signalId,[holderId])
            signal.registerOnChangeListener(()=>{
                this.distAlgo.propagate(signal,this.externalHolders.get(signalId))
                //this.environment.commMedium.sendMessage(holderId,new ExternalSignalChangeMessage(this.environment.thisRef,signal.id,serialise(signal.value,holderId,this.environment)))
            })
        }

        signal.registerOnDeleteListener(()=>{
            this.environment.commMedium.sendMessage(holderId,new ExternalSignalDeleteMessage(this.environment.thisRef,signal.id))
        })
    }

    externalChangeReceived(fromId : string,signalId : string,val : any){
        this.distAlgo.propagationReceived(fromId,signalId,val)
    }

    /*sourceChanged(signalId : string,val : any){
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
    }*/
}