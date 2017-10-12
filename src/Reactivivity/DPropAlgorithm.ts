import {SignalPool} from "./signalPool";
import {Signal} from "./signal";

export interface DPropAlgorithm {
    setSignalPool(signalPool : SignalPool)
    propagate(signal : Signal,toIds : Array<string>)
    propagationReceived(fromId : string, signalId : string,value : any)
}