import {DPropAlgorithm} from "./DPropAlgorithm";
import {SignalPool} from "./signalPool";
import {Signal, SignalFunction} from "./signal";
import {ExternalSignalChangeMessage} from "../Message";
import {serialise} from "../serialisation";

export class NoGlitchFreedom implements DPropAlgorithm{
    signalPool : SignalPool

    setSignalPool(signalPool : SignalPool){
        this.signalPool = signalPool
    }

    propagationReceived(fromId : string, signalId: string, value: any) {
        //Could be that the signal was garbage collected (shouldn't happen given the failure model)
        if(this.signalPool.knownSignal(signalId)){
            //Elm style propagation, signal pool serves as event dispatcher
            this.signalPool.sources.forEach((sourceSignal : Signal,id : string)=>{
                if(id == signalId){
                    sourceSignal.clock++
                    sourceSignal.change(value)
                }
                else{
                    sourceSignal.change(Signal.NO_CHANGE)
                }
            })
        }
    }

    propagate(signal: Signal,toIds : Array<string>) {
        toIds.forEach((toId : string)=>{
            this.signalPool.environment.commMedium.sendMessage(toId,new ExternalSignalChangeMessage(this.signalPool.environment.thisRef,signal.id,serialise(signal.value,toId,this.signalPool.environment)))
        })
    }

}