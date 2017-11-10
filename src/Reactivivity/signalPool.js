"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../messages");
var NoGlitchFreedom_1 = require("./NoGlitchFreedom");
/**
 * Created by flo on 22/06/2017.
 */
var SignalPool = (function () {
    function SignalPool(environment) {
        this.environment = environment;
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
    SignalPool.prototype.installDPropAlgorithm = function (algoInstance) {
        this.distAlgo = algoInstance;
        this.distAlgo.setSignalPool(this);
    };
    SignalPool.prototype.setLastPropMessage = function (propMessage) {
        this.lastPropMessage = propMessage;
    };
    SignalPool.prototype.setLastPulse = function (pulse) {
        this.lastPulse = pulse;
    };
    SignalPool.prototype.addMutator = function (className, methodName) {
        if (!this.mutators.has(className)) {
            this.mutators.set(className, []);
        }
        this.mutators.get(className).push(methodName);
    };
    SignalPool.prototype.isMutator = function (className, methodName) {
        return this.mutators.has(className) && this.mutators.get(className).includes(methodName);
    };
    SignalPool.prototype.newSource = function (signal) {
        this.sources.set(signal.id, signal);
        if (signal.rateLowerBound > 0) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    };
    SignalPool.prototype.knownSignal = function (signalId) {
        return this.sources.has(signalId) || this.signals.has(signalId);
    };
    SignalPool.prototype.trackLease = function (signalId, bound) {
        var _this = this;
        var signal;
        if (this.sources.has(signalId)) {
            signal = this.sources.get(signalId);
        }
        else {
            signal = this.signals.get(signalId);
        }
        var clockBefore = signal.clock;
        setTimeout(function () {
            var clockAfter = signal.clock;
            if (clockBefore == clockAfter) {
                if (!signal.strong) {
                    //console.log("Garbage collecting")
                    _this.garbageCollect(signal.id);
                }
                else {
                    //console.log("Lease failed but signal is strong so its ok ! ")
                }
            }
            else if (!_this.garbageCollected.includes(signalId)) {
                _this.trackLease(signalId, bound);
            }
        }, bound);
    };
    //Recursively delete all children of the specified head node
    SignalPool.prototype.garbageCollect = function (headId) {
        var _this = this;
        //Node might have been removed by common ancestor
        if (this.signals.has(headId) || this.sources.has(headId)) {
            var head = void 0;
            if (this.sources.has(headId)) {
                head = this.sources.get(headId);
            }
            else {
                head = this.signals.get(headId);
            }
            this.initiateGarbagePropagation(head);
            this.deleteSignal(head);
            head.children.forEach(function (child) {
                _this.garbageCollect(child.id);
            });
        }
    };
    //Garbage collect the garbage dependency graph (i.e. signals triggered by garbage collection of "regular" value signals)
    SignalPool.prototype.garbageCollectGarbage = function (headId) {
        var _this = this;
        var sig = this.garbageSignals.get(headId);
        this.garbageSignals.delete(headId);
        sig.garbageSignalDependencies.forEach(function (dependency) {
            dependency.signal.removeGarbageChild(headId);
        });
        sig.garbageChildren.forEach(function (child) {
            _this.garbageCollectGarbage(child.id);
        });
    };
    SignalPool.prototype.initiateGarbagePropagation = function (signal) {
        var _this = this;
        if (this.garbageDependencies.has(signal.id)) {
            this.garbageDependencies.get(signal.id).forEach(function (garbageId) {
                var destroy = _this.garbageSignals.get(garbageId).parentGarbageCollected(signal.id);
                if (destroy) {
                    _this.garbageCollectGarbage(garbageId);
                }
            });
        }
    };
    SignalPool.prototype.deleteSignal = function (signal) {
        this.signals.delete(signal.id);
        this.sources.delete(signal.id);
        this.garbageCollected.push(signal.id);
        signal.signalDependencies.forEach(function (dependency) {
            dependency.signal.removeChild(signal.id);
        });
        signal.triggerOnDelete();
    };
    SignalPool.prototype.newSignal = function (signal) {
        this.signals.set(signal.id, signal);
        if (signal.rateLowerBound > 0) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    };
    SignalPool.prototype.newGarbageSignal = function (signal) {
        this.garbageSignals.set(signal.id, signal);
    };
    SignalPool.prototype.addGarbageDependency = function (regularNodeId, garbageNodeId) {
        if (!this.garbageDependencies.has(regularNodeId)) {
            this.garbageDependencies.set(regularNodeId, new Array());
        }
        this.garbageDependencies.get(regularNodeId).push(garbageNodeId);
    };
    SignalPool.prototype.registerExternalListener = function (signalId, holderId) {
        var _this = this;
        var signal;
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
            signal.registerOnChangeListener(function () {
                _this.distAlgo.propagate(signal, _this.externalHolders.get(signalId));
                //this.environment.commMedium.sendMessage(holderId,new ExternalSignalChangeMessage(this.environment.thisRef,signal.id,serialise(signal.value,holderId,this.environment)))
            });
        }
        signal.registerOnDeleteListener(function () {
            _this.environment.commMedium.sendMessage(holderId, new messages_1.ExternalSignalDeleteMessage(_this.environment.thisRef, signal.id));
        });
    };
    SignalPool.prototype.externalChangeReceived = function (fromId, signalId, val) {
        this.distAlgo.propagationReceived(fromId, signalId, val);
    };
    return SignalPool;
}());
exports.SignalPool = SignalPool;
