Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../Message");
const NoGlitchFreedom_1 = require("./NoGlitchFreedom");
/**
 * Created by flo on 22/06/2017.
 */
class SignalPool {
    constructor(actorEnvironment) {
        this.environment = actorEnvironment;
        this.signals = new Map();
        this.garbageSignals = new Map();
        this.externalHolders = new Map();
        this.garbageDependencies = new Map();
        this.sources = new Map();
        this.garbageCollected = new Array();
        this.mutators = new Map();
        this.distAlgo = new NoGlitchFreedom_1.NoGlitchFreedom();
        this.distAlgo.setSignalPool(this);
    }
    installDPropAlgorithm(algoInstance) {
        this.distAlgo = algoInstance;
        this.distAlgo.setSignalPool(this);
    }
    setLastPropMessage(propMessage) {
        this.lastPropMessage = propMessage;
    }
    setLastPulse(pulse) {
        this.lastPulse = pulse;
    }
    addMutator(className, methodName) {
        if (!this.mutators.has(className)) {
            this.mutators.set(className, []);
        }
        this.mutators.get(className).push(methodName);
    }
    isMutator(className, methodName) {
        return this.mutators.has(className) && this.mutators.get(className).includes(methodName);
    }
    newSource(signal) {
        this.sources.set(signal.id, signal);
        if (signal.rateLowerBound > 0) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    }
    knownSignal(signalId) {
        return this.sources.has(signalId) || this.signals.has(signalId);
    }
    trackLease(signalId, bound) {
        let signal;
        if (this.sources.has(signalId)) {
            signal = this.sources.get(signalId);
        }
        else {
            signal = this.signals.get(signalId);
        }
        let clockBefore = signal.clock;
        setTimeout(() => {
            let clockAfter = signal.clock;
            if (clockBefore == clockAfter) {
                if (!signal.strong) {
                    //console.log("Garbage collecting")
                    this.garbageCollect(signal.id);
                }
                else {
                    //console.log("Lease failed but signal is strong so its ok ! ")
                }
            }
            else if (!this.garbageCollected.includes(signalId)) {
                this.trackLease(signalId, bound);
            }
        }, bound);
    }
    //Recursively delete all children of the specified head node
    garbageCollect(headId) {
        //Node might have been removed by common ancestor
        if (this.signals.has(headId) || this.sources.has(headId)) {
            let head;
            if (this.sources.has(headId)) {
                head = this.sources.get(headId);
            }
            else {
                head = this.signals.get(headId);
            }
            this.initiateGarbagePropagation(head);
            this.deleteSignal(head);
            head.children.forEach((child) => {
                this.garbageCollect(child.id);
            });
        }
    }
    //Garbage collect the garbage dependency graph (i.e. signals triggered by garbage collection of "regular" value signals)
    garbageCollectGarbage(headId) {
        let sig = this.garbageSignals.get(headId);
        this.garbageSignals.delete(headId);
        sig.garbageSignalDependencies.forEach((dependency) => {
            dependency.signal.removeGarbageChild(headId);
        });
        sig.garbageChildren.forEach((child) => {
            this.garbageCollectGarbage(child.id);
        });
    }
    initiateGarbagePropagation(signal) {
        if (this.garbageDependencies.has(signal.id)) {
            this.garbageDependencies.get(signal.id).forEach((garbageId) => {
                let destroy = this.garbageSignals.get(garbageId).parentGarbageCollected(signal.id);
                if (destroy) {
                    this.garbageCollectGarbage(garbageId);
                }
            });
        }
    }
    deleteSignal(signal) {
        this.signals.delete(signal.id);
        this.sources.delete(signal.id);
        this.garbageCollected.push(signal.id);
        signal.signalDependencies.forEach((dependency) => {
            dependency.signal.removeChild(signal.id);
        });
        signal.triggerOnDelete();
    }
    newSignal(signal) {
        this.signals.set(signal.id, signal);
        if (signal.rateLowerBound > 0) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    }
    newGarbageSignal(signal) {
        this.garbageSignals.set(signal.id, signal);
    }
    addGarbageDependency(regularNodeId, garbageNodeId) {
        if (!this.garbageDependencies.has(regularNodeId)) {
            this.garbageDependencies.set(regularNodeId, new Array());
        }
        this.garbageDependencies.get(regularNodeId).push(garbageNodeId);
    }
    registerExternalListener(signalId, holderId) {
        let signal;
        if (this.signals.has(signalId)) {
            signal = this.signals.get(signalId);
        }
        else if (this.sources.has(signalId)) {
            signal = this.sources.get(signalId);
        }
        else {
            throw new Error("Unable to find signal to register listener");
        }
        if (this.externalHolders.has(signalId)) {
            this.externalHolders.get(signalId).push(holderId);
        }
        else {
            this.externalHolders.set(signalId, [holderId]);
            signal.registerOnChangeListener(() => {
                this.distAlgo.propagate(signal, this.externalHolders.get(signalId));
                //this.environment.commMedium.sendMessage(holderId,new ExternalSignalChangeMessage(this.environment.thisRef,signal.id,serialise(signal.value,holderId,this.environment)))
            });
        }
        signal.registerOnDeleteListener(() => {
            this.environment.commMedium.sendMessage(holderId, new Message_1.ExternalSignalDeleteMessage(this.environment.thisRef, signal.id));
        });
    }
    externalChangeReceived(fromId, signalId, val) {
        this.distAlgo.propagationReceived(fromId, signalId, val);
    }
}
exports.SignalPool = SignalPool;
//# sourceMappingURL=signalPool.js.map