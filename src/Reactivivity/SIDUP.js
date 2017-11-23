var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const signal_1 = require("./signal");
const serialisation_1 = require("../serialisation");
class DijkstraScholten {
    constructor(listener = () => { }) {
        this.c = 0;
        this.d = 0;
        this.incoming = [];
        this.idle = 0;
        this.processing = 1;
        this.state = this.idle;
        this.listener = listener;
    }
    newParentMessage(parentRef) {
        this.state = this.processing;
        this.d++;
        this.incoming.push(parentRef);
    }
    newChildMessage() {
        this.state = this.processing;
        this.c++;
    }
    newAckMessage() {
        this.c--;
        if (this.c == 0) {
            this.sendAcks();
        }
    }
    nodeTerminated() {
        this.sendAcks();
    }
    sendAcks() {
        this.incoming.forEach((parentRef) => {
            this.d--;
            parentRef.ack();
        });
        if (this.d == 0) {
            this.state = this.idle;
            this.incoming = [];
            this.listener();
        }
    }
    isIdle() {
        return this.state == this.idle;
    }
}
class PulseState {
    constructor() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.pending = 0;
        this.unchanged = 1;
        this.changed = 2;
        this.state = this.pending;
    }
    isPending() {
        return this.state == this.pending;
    }
    isUnchanged() {
        return this.state == this.unchanged;
    }
    isChanged() {
        return this.state == this.changed;
    }
    setPending() {
        this.state = this.pending;
    }
    setUnchanged() {
        this.state = this.unchanged;
    }
    setChanged() {
        this.state = this.changed;
    }
}
class Mirror {
    constructor(ownerType) {
        //this[IsolateContainer.checkIsolateFuncKey]  = true
        this.ownerType = ownerType;
        this.pulseValue = new PulseState();
    }
}
class NodePulse {
    constructor(sourcesChanges, value, pulseState) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.sourcesChanges = sourcesChanges;
        this.value = value;
        this.pulseState = pulseState;
    }
}
exports.NodePulse = NodePulse;
class DependencyChangePulse {
    constructor(fromType, toType) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.fromType = fromType;
        this.toType = toType;
    }
}
class ReachableIsolate {
    constructor(reachables) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.reachables = reachables;
    }
}
class SIDUPAdmitter {
    constructor(ownType, sources, sinks, idleListener, changeListener, admitListener, hostActor) {
        this.termination = new DijkstraScholten(() => { this.returnedToIdle(); });
        this.waitingChanges = [];
        this.sinks = sinks;
        this.sources = sources;
        this.sourceRefs = [];
        this.sinksReady = 0;
        this.readyResolvers = [];
        this.sourceResolvers = [];
        this.idleListener = idleListener;
        this.changeListener = changeListener;
        this.admitListener = admitListener;
        hostActor.publish(this, ownType);
    }
    returnedToIdle() {
        this.idleListener();
        if (this.waitingChanges.length > 0) {
            let toResolve = this.waitingChanges[0];
            this.waitingChanges = this.waitingChanges.slice(1, this.waitingChanges.length);
            toResolve("ok");
            this.termination.newChildMessage();
        }
    }
    sourceChanged(withValue) {
        this.admitListener();
        if (this.termination.isIdle() && this.sinksReady == this.sinks) {
            this.termination.newChildMessage();
            if (this.changeListener) {
                return this.changeListener(withValue);
            }
            else {
                return "ok";
            }
        }
        else {
            return new Promise((resolve) => {
                let f = () => {
                    if (this.changeListener) {
                        resolve(this.changeListener(withValue));
                    }
                    else {
                        resolve("ok");
                    }
                };
                this.waitingChanges.push(f);
            });
        }
    }
    ack() {
        this.termination.newAckMessage();
    }
    sinkReady() {
        this.sinksReady++;
        if (this.sinksReady == this.sinks) {
            console.log("graph has been constructed");
            this.readyResolvers.forEach((resolver) => {
                resolver("ok");
            });
            this.readyResolvers = [];
            //There might already be changes buffered
            this.returnedToIdle();
        }
    }
    sourceRegister(sourceRef) {
        this.sourceRefs.push(sourceRef);
        if (this.sourceRefs.length == this.sources) {
            this.sourceResolvers.forEach((resolver) => {
                resolver();
            });
        }
    }
    graphReady() {
        if (this.sinksReady == this.sinks) {
            return "ok";
        }
        else {
            return new Promise((resolve) => {
                this.readyResolvers.push(resolve);
            });
        }
    }
    addDependency(fromType, toType) {
        let initiateChange = () => {
            console.log("Initiating change. Source refs: " + this.sourceRefs.length + " total : " + this.sources);
            this.sourceRefs.forEach((sourceRef) => {
                this.termination.newChildMessage();
                sourceRef.addDependency(this, new DependencyChangePulse(fromType, toType));
            });
        };
        if (this.sourceRefs.length == this.sources) {
            initiateChange();
        }
        else {
            this.sourceResolvers.push(initiateChange);
        }
    }
}
exports.SIDUPAdmitter = SIDUPAdmitter;
class SIDUPSourceSignal extends signal_1.SignalObject {
    change(parentVals) {
        this.parentVals = parentVals;
    }
}
__decorate([
    signal_1.mutator
], SIDUPSourceSignal.prototype, "change", null);
exports.SIDUPSourceSignal = SIDUPSourceSignal;
class SIDUPNode {
    constructor(ownType, parents, hostActor, admitterType, isSink = false) {
        this.host = hostActor;
        this.ownSignal = new SIDUPSourceSignal();
        this.parents = parents;
        this.ownType = ownType;
        this.pulseState = new PulseState();
        this.mirrors = new Map();
        this.parentReachable = new Map();
        this.reachable = [];
        this.setsReceived = 0;
        this.waiting = [];
        this.parentRefs = [];
        this.childrenRefs = [];
        this.childrenTypes = [];
        this.termination = new DijkstraScholten(() => { this.inChange = false; });
        this.admitterListeners = [];
        this.isSink = isSink;
        this.inChange = false;
        hostActor.publish(this, ownType);
        hostActor.subscribe(admitterType).each((admitterRef) => {
            this.admitterRef = admitterRef;
            if (this.parents.length == 0) {
                admitterRef.sourceRegister(this);
            }
            this.admitterListeners.forEach((admitListener) => {
                admitListener();
            });
        });
        if (this.parents.length == 0) {
            this.reachable.push(this.ownType.tagVal);
        }
        this.initTopology();
    }
    ////////////////////////////////////////
    // Algorithm                        ///
    ///////////////////////////////////////
    initTopology() {
        this.parents.forEach((parentType) => {
            this.mirrors.set(parentType.tagVal, new Mirror(parentType));
            this.host.subscribe(parentType).each((parentRef) => {
                this.parentRefs.push(parentRef);
                parentRef.getReachable(this, this.ownType).then((parentReachables) => {
                    //console.log("Inside: " + this.ownType.tagVal + " reachables for: " + parentType.tagVal + " = " + parentReachables.reachables)
                    this.setsReceived++;
                    parentReachables.reachables.forEach((reachable) => {
                        if (!this.reachable.includes(reachable)) {
                            this.reachable.push(reachable);
                        }
                    });
                    this.parentReachable.set(parentType.tagVal, parentReachables.reachables);
                    if (this.setsReceived == this.parents.length) {
                        this.waiting.forEach((waitingResolver) => {
                            waitingResolver(new ReachableIsolate(this.reachable));
                        });
                        if (this.isSink) {
                            this.sendToAdmitter(() => {
                                this.admitterRef.sinkReady();
                            });
                        }
                    }
                });
            });
        });
    }
    newPulse(senderType, senderRef, pulse) {
        this.termination.newParentMessage(senderRef);
        let senderMirror = this.mirrors.get(senderType.tagVal);
        senderMirror.steadyValue = pulse.value;
        senderMirror.pulseValue = pulse.pulseState;
        let propagate = true;
        this.parents.forEach((parenType) => {
            let parentMirror = this.mirrors.get(parenType.tagVal);
            if (parentMirror.pulseValue.isPending()) {
                let parentReachables = this.parentReachable.get(parenType.tagVal);
                let commonSources = parentReachables.filter((parentReachable) => {
                    return pulse.sourcesChanges.includes(parentReachable);
                });
                if (commonSources.length > 0) {
                    propagate = false;
                }
            }
        });
        if (propagate) {
            let anyChanged = false;
            let values = [];
            this.parents.forEach((parentType) => {
                let mirror = this.mirrors.get(parentType.tagVal);
                values.push(mirror.steadyValue);
                if (mirror.pulseValue.isChanged()) {
                    anyChanged = true;
                }
            });
            //No need to send actual pulse here. By changing the internal signal the "propagate" method will eventually be triggered
            if (anyChanged) {
                this.pulseState.setChanged();
                this.signalPool.setLastPulse(pulse);
                this.ownSignal.change(values);
            }
            else {
                this.pulseState.setUnchanged();
                this.signalPool.setLastPulse(pulse);
                this.ownSignal.holder.change(signal_1.Signal.NO_CHANGE);
            }
            this.reset();
            if (this.childrenRefs.length == 0) {
                this.termination.nodeTerminated();
            }
        }
    }
    reset() {
        this.pulseState.setPending();
        this.parents.forEach((parentType) => {
            let mirror = this.mirrors.get(parentType.tagVal);
            mirror.pulseValue.setPending();
        });
    }
    ////////////////////////////////////////
    // Calls made by other SIDUP nodes  ///
    ///////////////////////////////////////
    ack() {
        this.termination.newAckMessage();
    }
    getReachable(childRef, childType) {
        this.childrenRefs.push(childRef);
        this.childrenTypes.push(childType);
        if (this.setsReceived == this.parents.length) {
            return new ReachableIsolate(this.reachable);
        }
        else {
            return new Promise((resolve) => {
                this.waiting.push(resolve);
            });
        }
    }
    updateReachable(isNewParent, senderRef, senderType, reachables) {
        this.termination.newParentMessage(senderRef);
        if (isNewParent) {
            if (this.parentReachable.has(senderType.tagVal)) {
                throw new Error("New parent already exists");
            }
            else {
                this.mirrors.set(senderType.tagVal, new Mirror(senderType));
                this.parents.push(senderType);
                this.parentRefs.push(senderRef);
                this.parentReachable.set(senderType.tagVal, reachables.reachables);
            }
        }
        else {
            let previousReachables = this.parentReachable.get(senderType.tagVal);
            reachables.reachables.forEach((reachable) => {
                if (!previousReachables.includes(reachable)) {
                    previousReachables.push(reachable);
                }
            });
        }
        reachables.reachables.forEach((reachable) => {
            if (!this.reachable.includes(reachable)) {
                this.reachable.push(reachable);
            }
        });
        this.childrenRefs.forEach((childRef) => {
            this.termination.newChildMessage();
            childRef.updateReachable(false, this, this.ownType, new ReachableIsolate(this.reachable));
        });
        if (this.childrenRefs.length == 0) {
            this.termination.nodeTerminated();
        }
    }
    addDependency(sender, changePulse) {
        this.termination.newParentMessage(sender);
        let from = changePulse.fromType.tagVal;
        let to = changePulse.toType.tagVal;
        if (from == this.ownType.tagVal && !this.inChange) {
            let childTypes = this.childrenTypes.map((childType) => {
                return childType.tagVal;
            });
            if (childTypes.includes(to)) {
                throw new Error("Adding dependency which already exists");
            }
            else {
                this.childrenTypes.push(changePulse.toType);
                this.inChange = true;
                this.host.subscribe(changePulse.toType).once((newChildRef) => {
                    this.childrenRefs.push(newChildRef);
                    this.termination.newChildMessage();
                    newChildRef.updateReachable(true, this, this.ownType, new ReachableIsolate(this.reachable));
                });
            }
        }
        else if (!this.inChange) {
            this.inChange = true;
            this.childrenRefs.forEach((childRef) => {
                this.termination.newChildMessage();
                childRef.addDependency(this, changePulse);
            });
        }
        if (this.childrenRefs.length == 0 && !(to == this.ownType.tagVal)) {
            this.termination.nodeTerminated();
        }
    }
    getSignal(signal) {
        //Dummy method created to exchange signal
    }
    ////////////////////////////////////////
    // Calls made by Spiders.js          ///
    ///////////////////////////////////////
    setSignalPool(signalPool) {
        this.signalPool = signalPool;
    }
    sendToAdmitter(sendFunction) {
        if (this.admitterRef) {
            sendFunction();
        }
        else {
            this.admitterListeners.push(sendFunction);
        }
    }
    publishSignal(signal) {
        let publish = () => {
            this.childrenRefs.forEach((childRef) => {
                childRef.getSignal(signal);
            });
        };
        let checkAdmitter = () => {
            this.admitterRef.graphReady().then(() => {
                publish();
            });
        };
        this.sendToAdmitter(checkAdmitter);
        signal.holder.onChangeListener = () => {
            this.propagate(signal.holder, []);
        };
    }
    propagate(signal, toIds) {
        let propagateToChildren = (distributedsource, newVal = signal.value) => {
            let newPulse;
            //let newVal = signal.value
            if (newVal instanceof signal_1.SignalFunction) {
                newVal = newVal.lastVal;
            }
            if (distributedsource) {
                this.pulseState.setChanged();
                //console.log("Propagating to children in " + this.ownType.tagVal + " with state " + this.pulseState.state)
                newPulse = new NodePulse([this.ownType.tagVal], newVal, this.pulseState);
            }
            else {
                let triggeringPulse = this.signalPool.lastPulse;
                newPulse = new NodePulse(triggeringPulse.sourcesChanges, newVal, this.pulseState);
            }
            this.childrenRefs.forEach((childRef) => {
                this.termination.newChildMessage();
                childRef.newPulse(this.ownType, this, newPulse);
            });
        };
        //Check whether this node is at the start of the distributed dependency graph
        //In which case it first needs to ask "permission" to propagate from the admitter
        if (this.parents.length == 0) {
            let askAdmitter = () => {
                this.admitterRef.sourceChanged(signal.value).then((ret) => {
                    //This code is only triggered after accept from admitter
                    this.termination.newParentMessage(this.admitterRef);
                    if (ret == "ok") {
                        propagateToChildren(true);
                    }
                    else {
                        propagateToChildren(true, ret);
                    }
                });
            };
            this.sendToAdmitter(askAdmitter);
        }
        else {
            propagateToChildren(false);
        }
    }
    propagationReceived(fromId, signalId, value) {
        //Not needed
    }
}
exports.SIDUPNode = SIDUPNode;
//# sourceMappingURL=SIDUP.js.map