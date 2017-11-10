"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var signal_1 = require("./signal");
var serialisation_1 = require("../serialisation");
var DijkstraScholten = (function () {
    function DijkstraScholten(listener) {
        if (listener === void 0) { listener = function () { }; }
        this.c = 0;
        this.d = 0;
        this.incoming = [];
        this.idle = 0;
        this.processing = 1;
        this.state = this.idle;
        this.listener = listener;
    }
    DijkstraScholten.prototype.newParentMessage = function (parentRef) {
        this.state = this.processing;
        this.d++;
        this.incoming.push(parentRef);
    };
    DijkstraScholten.prototype.newChildMessage = function () {
        this.state = this.processing;
        this.c++;
    };
    DijkstraScholten.prototype.newAckMessage = function () {
        this.c--;
        if (this.c == 0) {
            this.sendAcks();
        }
    };
    DijkstraScholten.prototype.nodeTerminated = function () {
        this.sendAcks();
    };
    DijkstraScholten.prototype.sendAcks = function () {
        var _this = this;
        this.incoming.forEach(function (parentRef) {
            _this.d--;
            parentRef.ack();
        });
        if (this.d == 0) {
            this.state = this.idle;
            this.incoming = [];
            this.listener();
        }
    };
    DijkstraScholten.prototype.isIdle = function () {
        return this.state == this.idle;
    };
    return DijkstraScholten;
}());
var PulseState = (function () {
    function PulseState() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.pending = 0;
        this.unchanged = 1;
        this.changed = 2;
        this.state = this.pending;
    }
    PulseState.prototype.isPending = function () {
        return this.state == this.pending;
    };
    PulseState.prototype.isUnchanged = function () {
        return this.state == this.unchanged;
    };
    PulseState.prototype.isChanged = function () {
        return this.state == this.changed;
    };
    PulseState.prototype.setPending = function () {
        this.state = this.pending;
    };
    PulseState.prototype.setUnchanged = function () {
        this.state = this.unchanged;
    };
    PulseState.prototype.setChanged = function () {
        this.state = this.changed;
    };
    return PulseState;
}());
var Mirror = (function () {
    function Mirror(ownerType) {
        //this[IsolateContainer.checkIsolateFuncKey]  = true
        this.ownerType = ownerType;
        this.pulseValue = new PulseState();
    }
    return Mirror;
}());
var NodePulse = (function () {
    function NodePulse(sourcesChanges, value, pulseState) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.sourcesChanges = sourcesChanges;
        this.value = value;
        this.pulseState = pulseState;
    }
    return NodePulse;
}());
exports.NodePulse = NodePulse;
var DependencyChangePulse = (function () {
    function DependencyChangePulse(fromType, toType) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.fromType = fromType;
        this.toType = toType;
    }
    return DependencyChangePulse;
}());
var ReachableIsolate = (function () {
    function ReachableIsolate(reachables) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.reachables = reachables;
    }
    return ReachableIsolate;
}());
var SIDUPAdmitter = (function () {
    function SIDUPAdmitter(ownType, sources, sinks, hostActor) {
        var _this = this;
        this.termination = new DijkstraScholten(function () { _this.returnedToIdle(); });
        this.waitingChanges = [];
        this.sinks = sinks;
        this.sources = sources;
        this.sourceRefs = [];
        this.sinksReady = 0;
        this.readyResolvers = [];
        this.sourceResolvers = [];
        hostActor.publish(this, ownType);
    }
    SIDUPAdmitter.prototype.returnedToIdle = function () {
        if (this.waitingChanges.length > 0) {
            var toResolve = this.waitingChanges[0];
            this.waitingChanges = this.waitingChanges.slice(1, this.waitingChanges.length);
            toResolve("ok");
            this.termination.newChildMessage();
        }
    };
    SIDUPAdmitter.prototype.sourceChanged = function () {
        var _this = this;
        if (this.termination.isIdle() && this.sinksReady == this.sinks) {
            this.termination.newChildMessage();
            return "ok";
        }
        else {
            return new Promise(function (resolve) {
                _this.waitingChanges.push(resolve);
            });
        }
    };
    SIDUPAdmitter.prototype.ack = function () {
        this.termination.newAckMessage();
    };
    SIDUPAdmitter.prototype.sinkReady = function () {
        this.sinksReady++;
        if (this.sinksReady == this.sinks) {
            console.log("graph has been constructed");
            this.readyResolvers.forEach(function (resolver) {
                resolver("ok");
            });
            this.readyResolvers = [];
            //There might already be changes buffered
            this.returnedToIdle();
        }
    };
    SIDUPAdmitter.prototype.sourceRegister = function (sourceRef) {
        this.sourceRefs.push(sourceRef);
        if (this.sourceRefs.length == this.sources) {
            this.sourceResolvers.forEach(function (resolver) {
                resolver();
            });
        }
    };
    SIDUPAdmitter.prototype.graphReady = function () {
        var _this = this;
        if (this.sinksReady == this.sinks) {
            return "ok";
        }
        else {
            return new Promise(function (resolve) {
                _this.readyResolvers.push(resolve);
            });
        }
    };
    SIDUPAdmitter.prototype.addDependency = function (fromType, toType) {
        var _this = this;
        var initiateChange = function () {
            console.log("Initiating change. Source refs: " + _this.sourceRefs.length + " total : " + _this.sources);
            _this.sourceRefs.forEach(function (sourceRef) {
                _this.termination.newChildMessage();
                sourceRef.addDependency(_this, new DependencyChangePulse(fromType, toType));
            });
        };
        if (this.sourceRefs.length == this.sources) {
            initiateChange();
        }
        else {
            this.sourceResolvers.push(initiateChange);
        }
    };
    return SIDUPAdmitter;
}());
exports.SIDUPAdmitter = SIDUPAdmitter;
var SIDUPSourceSignal = (function (_super) {
    __extends(SIDUPSourceSignal, _super);
    function SIDUPSourceSignal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SIDUPSourceSignal.prototype.change = function (parentVals) {
        this.parentVals = parentVals;
    };
    __decorate([
        signal_1.mutator
    ], SIDUPSourceSignal.prototype, "change", null);
    return SIDUPSourceSignal;
}(signal_1.SignalObject));
exports.SIDUPSourceSignal = SIDUPSourceSignal;
var SIDUPNode = (function () {
    function SIDUPNode(ownType, parents, hostActor, admitterType, isSink) {
        if (isSink === void 0) { isSink = false; }
        var _this = this;
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
        this.termination = new DijkstraScholten(function () { _this.inChange = false; });
        this.admitterListeners = [];
        this.isSink = isSink;
        this.inChange = false;
        hostActor.publish(this, ownType);
        hostActor.subscribe(admitterType).each(function (admitterRef) {
            _this.admitterRef = admitterRef;
            if (_this.parents.length == 0) {
                admitterRef.sourceRegister(_this);
            }
            _this.admitterListeners.forEach(function (admitListener) {
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
    SIDUPNode.prototype.initTopology = function () {
        var _this = this;
        this.parents.forEach(function (parentType) {
            _this.mirrors.set(parentType.tagVal, new Mirror(parentType));
            _this.host.subscribe(parentType).each(function (parentRef) {
                _this.parentRefs.push(parentRef);
                parentRef.getReachable(_this, _this.ownType).then(function (parentReachables) {
                    //console.log("Inside: " + this.ownType.tagVal + " reachables for: " + parentType.tagVal + " = " + parentReachables.reachables)
                    _this.setsReceived++;
                    parentReachables.reachables.forEach(function (reachable) {
                        if (!_this.reachable.includes(reachable)) {
                            _this.reachable.push(reachable);
                        }
                    });
                    _this.parentReachable.set(parentType.tagVal, parentReachables.reachables);
                    if (_this.setsReceived == _this.parents.length) {
                        _this.waiting.forEach(function (waitingResolver) {
                            waitingResolver(new ReachableIsolate(_this.reachable));
                        });
                        if (_this.isSink) {
                            _this.sendToAdmitter(function () {
                                _this.admitterRef.sinkReady();
                            });
                        }
                    }
                });
            });
        });
    };
    SIDUPNode.prototype.newPulse = function (senderType, senderRef, pulse) {
        var _this = this;
        this.termination.newParentMessage(senderRef);
        var senderMirror = this.mirrors.get(senderType.tagVal);
        senderMirror.steadyValue = pulse.value;
        senderMirror.pulseValue = pulse.pulseState;
        var propagate = true;
        this.parents.forEach(function (parenType) {
            var parentMirror = _this.mirrors.get(parenType.tagVal);
            if (parentMirror.pulseValue.isPending()) {
                var parentReachables = _this.parentReachable.get(parenType.tagVal);
                var commonSources = parentReachables.filter(function (parentReachable) {
                    return pulse.sourcesChanges.includes(parentReachable);
                });
                if (commonSources.length > 0) {
                    propagate = false;
                }
            }
        });
        if (propagate) {
            var anyChanged_1 = false;
            var values_1 = [];
            this.parents.forEach(function (parentType) {
                var mirror = _this.mirrors.get(parentType.tagVal);
                values_1.push(mirror.steadyValue);
                if (mirror.pulseValue.isChanged()) {
                    anyChanged_1 = true;
                }
            });
            //No need to send actual pulse here. By changing the internal signal the "propagate" method will eventually be triggered
            if (anyChanged_1) {
                this.pulseState.setChanged();
                this.signalPool.setLastPulse(pulse);
                this.ownSignal.change(values_1);
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
    };
    SIDUPNode.prototype.reset = function () {
        var _this = this;
        this.pulseState.setPending();
        this.parents.forEach(function (parentType) {
            var mirror = _this.mirrors.get(parentType.tagVal);
            mirror.pulseValue.setPending();
        });
    };
    ////////////////////////////////////////
    // Calls made by other SIDUP nodes  ///
    ///////////////////////////////////////
    SIDUPNode.prototype.ack = function () {
        this.termination.newAckMessage();
    };
    SIDUPNode.prototype.getReachable = function (childRef, childType) {
        var _this = this;
        this.childrenRefs.push(childRef);
        this.childrenTypes.push(childType);
        if (this.setsReceived == this.parents.length) {
            return new ReachableIsolate(this.reachable);
        }
        else {
            return new Promise(function (resolve) {
                _this.waiting.push(resolve);
            });
        }
    };
    SIDUPNode.prototype.updateReachable = function (isNewParent, senderRef, senderType, reachables) {
        var _this = this;
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
            var previousReachables_1 = this.parentReachable.get(senderType.tagVal);
            reachables.reachables.forEach(function (reachable) {
                if (!previousReachables_1.includes(reachable)) {
                    previousReachables_1.push(reachable);
                }
            });
        }
        reachables.reachables.forEach(function (reachable) {
            if (!_this.reachable.includes(reachable)) {
                _this.reachable.push(reachable);
            }
        });
        this.childrenRefs.forEach(function (childRef) {
            _this.termination.newChildMessage();
            childRef.updateReachable(false, _this, _this.ownType, new ReachableIsolate(_this.reachable));
        });
        if (this.childrenRefs.length == 0) {
            this.termination.nodeTerminated();
        }
    };
    SIDUPNode.prototype.addDependency = function (sender, changePulse) {
        var _this = this;
        this.termination.newParentMessage(sender);
        var from = changePulse.fromType.tagVal;
        var to = changePulse.toType.tagVal;
        if (from == this.ownType.tagVal && !this.inChange) {
            var childTypes = this.childrenTypes.map(function (childType) {
                return childType.tagVal;
            });
            if (childTypes.includes(to)) {
                throw new Error("Adding dependency which already exists");
            }
            else {
                this.childrenTypes.push(changePulse.toType);
                this.inChange = true;
                this.host.subscribe(changePulse.toType).once(function (newChildRef) {
                    _this.childrenRefs.push(newChildRef);
                    _this.termination.newChildMessage();
                    newChildRef.updateReachable(true, _this, _this.ownType, new ReachableIsolate(_this.reachable));
                });
            }
        }
        else if (!this.inChange) {
            this.inChange = true;
            this.childrenRefs.forEach(function (childRef) {
                _this.termination.newChildMessage();
                childRef.addDependency(_this, changePulse);
            });
        }
        if (this.childrenRefs.length == 0 && !(to == this.ownType.tagVal)) {
            this.termination.nodeTerminated();
        }
    };
    SIDUPNode.prototype.getSignal = function (signal) {
        //Dummy method created to exchange signal
    };
    ////////////////////////////////////////
    // Calls made by Spiders.js          ///
    ///////////////////////////////////////
    SIDUPNode.prototype.setSignalPool = function (signalPool) {
        this.signalPool = signalPool;
    };
    SIDUPNode.prototype.sendToAdmitter = function (sendFunction) {
        if (this.admitterRef) {
            sendFunction();
        }
        else {
            this.admitterListeners.push(sendFunction);
        }
    };
    SIDUPNode.prototype.publishSignal = function (signal) {
        var _this = this;
        var publish = function () {
            _this.childrenRefs.forEach(function (childRef) {
                childRef.getSignal(signal);
            });
        };
        var checkAdmitter = function () {
            _this.admitterRef.graphReady().then(function () {
                publish();
            });
        };
        this.sendToAdmitter(checkAdmitter);
        signal.holder.onChangeListener = function () {
            _this.propagate(signal.holder, []);
        };
    };
    SIDUPNode.prototype.propagate = function (signal, toIds) {
        var _this = this;
        var propagateToChildren = function (distributedsource) {
            var newPulse;
            var newVal = signal.value;
            if (newVal instanceof signal_1.SignalFunction) {
                newVal = newVal.lastVal;
            }
            if (distributedsource) {
                _this.pulseState.setChanged();
                //console.log("Propagating to children in " + this.ownType.tagVal + " with state " + this.pulseState.state)
                newPulse = new NodePulse([_this.ownType.tagVal], newVal, _this.pulseState);
            }
            else {
                var triggeringPulse = _this.signalPool.lastPulse;
                newPulse = new NodePulse(triggeringPulse.sourcesChanges, newVal, _this.pulseState);
            }
            _this.childrenRefs.forEach(function (childRef) {
                _this.termination.newChildMessage();
                childRef.newPulse(_this.ownType, _this, newPulse);
            });
        };
        //Check whether this node is at the start of the distributed dependency graph
        //In which case it first needs to ask "permission" to propagate from the admitter
        if (this.parents.length == 0) {
            var askAdmitter = function () {
                _this.admitterRef.sourceChanged().then(function () {
                    //This code is only triggered after accept from admitter
                    _this.termination.newParentMessage(_this.admitterRef);
                    propagateToChildren(true);
                });
            };
            this.sendToAdmitter(askAdmitter);
        }
        else {
            propagateToChildren(false);
        }
    };
    SIDUPNode.prototype.propagationReceived = function (fromId, signalId, value) {
        //Not needed
    };
    return SIDUPNode;
}());
exports.SIDUPNode = SIDUPNode;
