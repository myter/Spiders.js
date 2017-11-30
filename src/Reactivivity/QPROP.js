var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialisation_1 = require("../serialisation");
const Queue_1 = require("./Queue");
const signal_1 = require("./signal");
class SourceIsolate {
    constructor(sources) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.sources = sources;
    }
}
class PropagationValue {
    constructor(origin, value, timeStamp) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.origin = origin;
        this.value = value;
        this.timeStamp = timeStamp;
    }
    asString() {
        for (var i in this) {
            if (i == "origin") {
                console.log(i);
                console.log("Value check1: " + this[i]);
            }
        }
        console.log("Value check2: " + this["origin"]);
        return (this.origin.asString()) + " , " + this.value + " , " + this.timeStamp;
    }
}
exports.PropagationValue = PropagationValue;
class QPROPSourceSignal extends signal_1.SignalObject {
    change(parentVals) {
        this.parentVals = parentVals;
    }
}
__decorate([
    signal_1.mutator
], QPROPSourceSignal.prototype, "change", null);
exports.QPROPSourceSignal = QPROPSourceSignal;
class DependencyChange {
    constructor(fromType, toType) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.fromType = fromType;
        this.toType = toType;
    }
}
exports.DependencyChange = DependencyChange;
class QPROPNode {
    constructor(ownType, directParents, directChildren, hostActor, defaultVal, dependencyChangeType, isDynamic) {
        this.host = hostActor;
        this.ownType = ownType;
        this.ownSignal = new QPROPSourceSignal();
        this.ownDefault = defaultVal;
        this.directChildren = directChildren;
        this.directParents = directParents;
        this.directChildrenRefs = [];
        this.directParentRefs = [];
        this.directParentLastKnownVals = new Map();
        this.directParentDefaultVals = new Map();
        this.sourceMap = new Map();
        this.propagationPaths = new Map();
        this.inputQueues = new Map();
        this.parentsReceived = 0;
        this.startsReceived = 0;
        this.readyListeners = [];
        this.instabilitySet = [];
        this.stampCounter = 0;
        this.dynamic = isDynamic;
        this.parentSignals = new Map();
        //this.printInfo()
        hostActor.publish(this, ownType);
        hostActor.subscribe(dependencyChangeType).each((change) => {
            //console.log("Dependency addition detected")
            if (change.toType.tagVal == this.ownType.tagVal && !this.contains(this.directParents, change.fromType)) {
                this.dynamicDependencyAddition(change);
            }
        });
        this.pickInit();
    }
    ////////////////////////////////////////
    // Helping function                 ///
    ///////////////////////////////////////
    printInfo() {
        console.log("Info for: " + this.ownType.tagVal);
        console.log("Direct Parents: " + this.directParents.length);
        this.directParents.forEach((parent) => {
            console.log(parent.tagVal);
        });
        console.log("Direct Children: " + this.directChildren.length);
        this.directChildren.forEach((child) => {
            console.log(child.tagVal);
        });
        console.log("Queue info:");
        this.inputQueues.forEach((qs, parent) => {
            console.log("Queues for : " + parent);
            qs.forEach((q, source) => {
                console.log("Source: " + source);
                console.log("Length: " + q.getLength());
            });
        });
    }
    receivedAllParents() {
        return (this.parentsReceived == this.directParents.length) && (this.directParentRefs.length == this.directParents.length);
    }
    sendReady() {
        if ((this.startsReceived == this.directChildren.length) && (this.directParentRefs.length == this.directParents.length) && (this.directChildren.length != 0)) {
            this.directParentRefs.forEach((parentRef) => {
                parentRef.receiveStart(this.ownType);
            });
            this.readyListeners.forEach((readyListener) => {
                readyListener();
            });
            console.log("Node : " + this.ownType.tagVal + " is ready !");
        }
    }
    sendParents() {
        if (this.receivedAllParents() && (this.directChildrenRefs.length == this.directChildren.length)) {
            this.directChildrenRefs.forEach((childRef) => {
                childRef.receiveParents(this.ownType, this.getAllSources(), this.ownDefault);
            });
            if (this.directChildrenRefs.length == 0 && (this.directParentRefs.length == this.directParents.length)) {
                this.directParentRefs.forEach((parentRef) => {
                    parentRef.receiveStart(this.ownType);
                });
                console.log("Node : " + this.ownType.tagVal + " is ready !");
            }
        }
    }
    getAllSources() {
        let all = [];
        this.sourceMap.forEach((sources) => {
            sources.forEach((source) => {
                if (!this.contains(all, source)) {
                    all.push(source);
                }
            });
        });
        if (this.directParents.length == 0) {
            all.push(this.ownType);
        }
        return new SourceIsolate(all);
    }
    constructQueue(from, sources) {
        this.sourceMap.set(from.tagVal, sources);
        let allQs = this.inputQueues.get(from.tagVal);
        sources.forEach((source) => {
            allQs.set(source.tagVal, new Queue_1.Queue());
        });
    }
    contains(typeArray, targettype) {
        return typeArray.filter((type) => {
            return type.tagVal == targettype.tagVal;
        }).length > 0;
    }
    ////////////////////////////////////////
    // Algorithm                        ///
    ///////////////////////////////////////
    pickInit() {
        this.directParents.forEach((parentType) => {
            this.inputQueues.set(parentType.tagVal, new Map());
        });
        if (this.dynamic) {
            this.initDynamic();
        }
        else {
            this.initRegular();
        }
        //Spiders.js sometimes fails to deliver the isReferences message (not a QPROP issue) TODO need to check this
        /*let check = (ref)=>{
            ref.isReferenced(this.ownType).then((b)=>{
                if(b){
                    this.initRegular()
                }
                else{
                    //console.log("Init dynamic for: " + this.ownType.tagVal)
                    this.initDynamic()
                    this.dynamic = true
                }
            })
        }
        if(this.directParents.length == 0){
            this.host.subscribe(this.directChildren[0]).once((childRef  : FarRef)=>{
                check(childRef)
            })
        }
        else{
            this.host.subscribe(this.directParents[0]).once((parentRef : FarRef)=>{
                check(parentRef)
            })
        }*/
    }
    initRegular() {
        this.directParents.forEach((parenType) => {
            this.host.subscribe(parenType).each((parentRef) => {
                this.directParentRefs.push(parentRef);
                this.sendReady();
                if (this.receivedAllParents() && this.directChildren.length == 0) {
                    this.directParentRefs.forEach((parentRef) => {
                        parentRef.receiveStart(this.ownType);
                    });
                    //console.log("Node : " + this.ownType.tagVal + " is ready !")
                }
            });
        });
        this.directChildren.forEach((childType) => {
            this.host.subscribe(childType).each((childRef) => {
                this.directChildrenRefs.push(childRef);
                if ((this.directChildrenRefs.length == this.directChildren.length) && this.directParents.length == 0) {
                    this.directChildrenRefs.forEach((childRef) => {
                        childRef.receiveParents(this.ownType, this.getAllSources(), this.ownDefault);
                    });
                }
                else {
                    this.sendParents();
                }
            });
        });
    }
    initDynamic() {
        let updateParents = () => {
            this.directParentRefs.forEach((parentRef) => {
                parentRef.addChild(this);
            });
        };
        let updateChildren = () => {
            let childrenUpdated = 0;
            this.directChildren.forEach((childType) => {
                this.host.subscribe(childType).each((childRef) => {
                    this.directChildrenRefs.push(childRef);
                    childRef.updateSources(this.ownType, this.getAllSources(), true, this.ownDefault).then(() => {
                        childrenUpdated++;
                        if (childrenUpdated == this.directChildren.length) {
                            updateParents();
                        }
                    });
                });
            });
        };
        let queuesConstructed = 0;
        this.directParents.forEach((parentType) => {
            this.host.subscribe(parentType).each((parentRef) => {
                this.directParentRefs.push(parentRef);
                parentRef.getDefaultValue().then((defVal) => {
                    this.directParentDefaultVals.set(parentType.tagVal, defVal);
                });
                parentRef.getSourceMap().then((sourceMap) => {
                    let theseSources = this.getAllSources().sources;
                    sourceMap.sources.forEach((source) => {
                        let hasSource = this.contains(theseSources, source);
                        let hasInstable = this.contains(this.instabilitySet, source);
                        if (hasSource && hasInstable) {
                            this.instabilitySet.push(source);
                        }
                    });
                    this.constructQueue(parentType, sourceMap.sources);
                    queuesConstructed++;
                    if (queuesConstructed == this.directParents.length) {
                        updateChildren();
                    }
                });
            });
        });
        if (this.directParents.length == 0) {
            updateChildren();
        }
    }
    dynamicDependencyAddition(change) {
        this.inputQueues.set(change.fromType.tagVal, new Map());
        this.directParents.push(change.fromType);
        this.host.subscribe(change.fromType).once((fromRef) => {
            this.directParentRefs.push(fromRef);
            fromRef.getDefaultValue().then((defVal) => {
                this.directParentDefaultVals.set(change.fromType.tagVal, defVal);
            });
            fromRef.getSourceMap().then((sourceMap) => {
                let theseSources = this.getAllSources().sources;
                sourceMap.sources.forEach((source) => {
                    let hasSource = this.contains(theseSources, source);
                    let hasInstable = this.contains(this.instabilitySet, source);
                    if (hasSource && hasInstable) {
                        this.instabilitySet.push(source);
                    }
                });
                this.constructQueue(change.fromType, sourceMap.sources);
                let childrenUpdated = 0;
                this.directChildrenRefs.forEach((childRef) => {
                    childRef.updateSources(this.ownType, this.getAllSources(), true, this.ownDefault).then(() => {
                        childrenUpdated++;
                        if (childrenUpdated == this.directChildren.length) {
                            fromRef.addChild(this);
                        }
                    });
                });
                if (this.directChildren.length == 0) {
                    fromRef.addChild(this);
                }
            });
        });
    }
    canPropagate(messageOrigin) {
        let propagate = true;
        let qs = [];
        this.inputQueues.forEach((qSet, parentType) => {
            if (qSet.has(messageOrigin.tagVal)) {
                let q = qSet.get(messageOrigin.tagVal);
                qs.push(q);
                if (q.isEmpty()) {
                    propagate = false;
                }
            }
        });
        if (this.contains(this.instabilitySet, messageOrigin)) {
            return propagate && this.canStabilise(qs, messageOrigin);
        }
        else {
            return propagate;
        }
    }
    canStabilise(qs, messageOrigin) {
        let commonStamps = [];
        let allStamps = [];
        let commonTimeStamp = false;
        qs.forEach((outerQ) => {
            outerQ.peekAll((v) => {
                let found = true;
                allStamps.push(v.timeStamp);
                qs.forEach((innerQ) => {
                    if (outerQ != innerQ) {
                        found = found && (innerQ.contains((el) => { return el.timeStamp == v.timeStamp; }));
                    }
                });
                if (found && (!commonStamps.includes(v.timeStamp))) {
                    commonStamps.push(v.timeStamp);
                }
                commonTimeStamp = commonTimeStamp || found;
            });
        });
        if (commonTimeStamp) {
            let lowest = -1;
            commonStamps.forEach((stamp) => {
                if (stamp < lowest || lowest < 0) {
                    lowest = stamp;
                }
            });
            qs.forEach((q) => {
                q.remove((val) => {
                    return val.timeStamp >= lowest;
                });
            });
            this.instabilitySet = this.instabilitySet.filter((source) => {
                return source.tagVal != messageOrigin.tagVal;
            });
        }
        return commonTimeStamp;
    }
    getArgumentPosition(parentType) {
        let index = -1;
        this.directParents.forEach((parent, i) => {
            if (parent.tagVal == parentType) {
                index = i;
            }
        });
        if (index < 0) {
            throw new Error("Trying to fetch argument position of unknown parent type: " + parentType + " parents: " + this.directParents);
        }
        else {
            return index;
        }
    }
    getPropagationArguments(messageOrigin) {
        let args = new Array(this.directParents.length);
        this.inputQueues.forEach((qSet, parentType) => {
            if (qSet.has(messageOrigin.tagVal)) {
                let q = qSet.get(messageOrigin.tagVal);
                args[this.getArgumentPosition(parentType)] = q.deQueue().value;
            }
            else {
                if (this.directParentLastKnownVals.has(parentType)) {
                    args[this.getArgumentPosition(parentType)] = this.directParentLastKnownVals.get(parentType);
                }
                else {
                    args[this.getArgumentPosition(parentType)] = this.directParentDefaultVals.get(parentType);
                }
            }
        });
        return args;
    }
    ////////////////////////////////////////
    // Calls made by other QPROP nodes  ///
    ///////////////////////////////////////
    receiveStart(from) {
        this.startsReceived++;
        this.sendReady();
    }
    receiveParents(from, sources, defaultValue) {
        this.parentsReceived++;
        this.directParentDefaultVals.set(from.tagVal, defaultValue);
        this.constructQueue(from, sources.sources);
        this.sendParents();
    }
    receiveMessage(from, message) {
        let qSet = this.inputQueues.get(from.tagVal);
        let originQueue = qSet.get(message.origin.tagVal);
        try {
            originQueue.enQueue(message);
        }
        catch (e) {
            if (this.ownType.tagVal == "50") {
                console.log("UNABLE TO ENQUEUE FOR ORIGIN: " + message.origin.tagVal + " in " + this.ownType.tagVal + " from parent: " + from.tagVal);
            }
        }
        this.directParentLastKnownVals.set(from.tagVal, message.value);
        let canPropagate = this.canPropagate(message.origin);
        if (canPropagate) {
            let args = this.getPropagationArguments(message.origin);
            //This will start propagation of local change. The exported signal will invoke the propagate method (which will send
            this.signalPool.setLastPropMessage(message);
            this.ownSignal.change(args);
            //THIS IS DIFFERENT FROM AT VERSION
            /*this.directChildrenRefs.forEach((childRef : FarRef)=>{
                childRef.receiveMessage(this.ownType,new PropagationValue(message.origin,this.ownSignal.v,message.timeStamp))
            })*/
        }
    }
    isReferenced(someType) {
        return (this.contains(this.directParents, someType)) || (this.contains(this.directChildren, someType));
    }
    addChild(childRef) {
        this.directChildrenRefs.push(childRef);
    }
    getDefaultValue() {
        return this.ownDefault;
    }
    updateSources(from, sourceMap, updateDef = false, defVal = null) {
        if (from.tagVal != this.ownType.tagVal) {
            let sources = sourceMap.sources;
            let mySources = this.getAllSources().sources;
            sources.forEach((source) => {
                if (this.contains(mySources, source) && (!this.contains(this.instabilitySet, source))) {
                    this.instabilitySet.push(source);
                }
            });
            if (updateDef) {
                this.inputQueues.set(from.tagVal, new Map());
                this.directParentDefaultVals.set(from.tagVal, defVal);
                this.directParents.push(from);
            }
            this.constructQueue(from, sources);
            if (this.directChildren.length == 0) {
                return "ok";
            }
            else {
                let resReceived = 0;
                return new Promise((resolve) => {
                    this.directChildrenRefs.forEach((childRef) => {
                        childRef.updateSources(this.ownType, sourceMap).then(() => {
                            resReceived++;
                            if (resReceived == this.directChildren.length) {
                                resolve("ok");
                            }
                        });
                    });
                });
            }
        }
    }
    getSourceMap() {
        return this.getAllSources();
    }
    getSignal(signal) {
        //Dummy neeed to trigger underlying deserialisation of SpiderS.js
    }
    ////////////////////////////////////////
    // Calls made by Spiders.js          ///
    ///////////////////////////////////////
    setSignalPool(signalPool) {
        this.signalPool = signalPool;
    }
    publishSignal(signal) {
        let publish = () => {
            this.directChildrenRefs.forEach((childRef) => {
                childRef.getSignal(signal);
            });
        };
        if (this.directChildrenRefs.length == this.directChildren.length) {
            publish();
        }
        else {
            this.readyListeners.push(publish);
        }
        if (this.startsReceived != this.directChildren.length || !this.dynamic) {
            signal.holder.onChangeListener = () => {
                this.propagate(signal.holder, []);
            };
        }
    }
    //Called by spiders.js when exported signal must propagate
    propagate(signal, toIds) {
        var that = this;
        let newVal = signal.value;
        if (newVal instanceof signal_1.SignalFunction) {
            newVal = newVal.lastVal;
        }
        let sendToAll = () => {
            if (this.directParents.length == 0) {
                this.directChildrenRefs.forEach((childRef) => {
                    childRef.receiveMessage(that.ownType, new PropagationValue(that.ownType, newVal, that.stampCounter));
                });
                this.stampCounter++;
            }
            else {
                //Get the message which originally triggered the local propagation
                let propMessage = this.signalPool.lastPropMessage;
                this.directChildrenRefs.forEach((childRef) => {
                    childRef.receiveMessage(this.ownType, new PropagationValue(propMessage.origin, newVal, propMessage.timeStamp));
                });
            }
        };
        if (this.startsReceived == this.directChildren.length || this.dynamic) {
            sendToAll();
        }
        else {
            this.readyListeners.push(sendToAll);
        }
    }
    //No need to implement this, QPROP overrides this behaviour
    propagationReceived(fromId, signalId, value) {
        //Not needed
    }
}
exports.QPROPNode = QPROPNode;
//# sourceMappingURL=QPROP.js.map