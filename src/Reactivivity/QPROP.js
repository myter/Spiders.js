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
var serialisation_1 = require("../serialisation");
var Queue_1 = require("./Queue");
var signal_1 = require("./signal");
var SourceIsolate = (function () {
    function SourceIsolate(sources) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.sources = sources;
    }
    return SourceIsolate;
}());
var PropagationValue = (function () {
    function PropagationValue(origin, value, timeStamp) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.origin = origin;
        this.value = value;
        this.timeStamp = timeStamp;
    }
    PropagationValue.prototype.asString = function () {
        for (var i in this) {
            if (i == "origin") {
                console.log(i);
                console.log("Value check1: " + this[i]);
            }
        }
        console.log("Value check2: " + this["origin"]);
        return (this.origin.asString()) + " , " + this.value + " , " + this.timeStamp;
    };
    return PropagationValue;
}());
exports.PropagationValue = PropagationValue;
var QPROPSourceSignal = (function (_super) {
    __extends(QPROPSourceSignal, _super);
    function QPROPSourceSignal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QPROPSourceSignal.prototype.change = function (parentVals) {
        this.parentVals = parentVals;
    };
    __decorate([
        signal_1.mutator
    ], QPROPSourceSignal.prototype, "change", null);
    return QPROPSourceSignal;
}(signal_1.SignalObject));
exports.QPROPSourceSignal = QPROPSourceSignal;
var DependencyChange = (function () {
    function DependencyChange(fromType, toType) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.fromType = fromType;
        this.toType = toType;
    }
    return DependencyChange;
}());
exports.DependencyChange = DependencyChange;
var QPROPNode = (function () {
    function QPROPNode(ownType, directParents, directChildren, hostActor, defaultVal, dependencyChangeType) {
        var _this = this;
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
        this.dynamic = false;
        this.parentSignals = new Map();
        hostActor.publish(this, ownType);
        hostActor.subscribe(dependencyChangeType).each(function (change) {
            console.log("Dependency addition detected");
            if (change.toType.tagVal == _this.ownType.tagVal) {
                _this.dynamicDependencyAddition(change);
            }
        });
        this.pickInit();
    }
    ////////////////////////////////////////
    // Helping function                 ///
    ///////////////////////////////////////
    QPROPNode.prototype.printInfo = function () {
        console.log("Info for: " + this.ownType.tagVal);
        /*console.log("Direct Parents: " + this.directParents.length)
        this.directParents.forEach((parent : PubSubTag)=>{
            console.log(parent.tagVal)
        })
        console.log("Direct Children: " + this.directChildren.length)
        this.directChildren.forEach((child : PubSubTag)=>{
            console.log(child.tagVal)
        })*/
        console.log("Queue info:");
        this.inputQueues.forEach(function (qs, parent) {
            console.log("Queues for : " + parent);
            qs.forEach(function (_, source) {
                console.log("Source: " + source);
            });
        });
    };
    QPROPNode.prototype.receivedAllParents = function () {
        return (this.parentsReceived == this.directParents.length) && (this.directParentRefs.length == this.directParents.length);
    };
    QPROPNode.prototype.sendReady = function () {
        var _this = this;
        if ((this.startsReceived == this.directChildren.length) && (this.directParentRefs.length == this.directParents.length) && (this.directChildren.length != 0)) {
            this.directParentRefs.forEach(function (parentRef) {
                parentRef.receiveStart(_this.ownType);
            });
            this.readyListeners.forEach(function (readyListener) {
                readyListener();
            });
            console.log("Node : " + this.ownType.tagVal + " is ready !");
        }
    };
    QPROPNode.prototype.sendParents = function () {
        var _this = this;
        if (this.receivedAllParents() && (this.directChildrenRefs.length == this.directChildren.length)) {
            this.directChildrenRefs.forEach(function (childRef) {
                childRef.receiveParents(_this.ownType, _this.getAllSources(), _this.ownDefault);
            });
            if (this.directChildrenRefs.length == 0 && (this.directParentRefs.length == this.directParents.length)) {
                this.directParentRefs.forEach(function (parentRef) {
                    parentRef.receiveStart(_this.ownType);
                });
                console.log("Node : " + this.ownType.tagVal + " is ready !");
            }
        }
    };
    QPROPNode.prototype.getAllSources = function () {
        var _this = this;
        var all = [];
        this.sourceMap.forEach(function (sources) {
            sources.forEach(function (source) {
                if (!_this.contains(all, source)) {
                    all.push(source);
                }
            });
        });
        if (this.directParents.length == 0) {
            all.push(this.ownType);
        }
        return new SourceIsolate(all);
    };
    QPROPNode.prototype.constructQueue = function (from, sources) {
        this.sourceMap.set(from.tagVal, sources);
        var allQs = this.inputQueues.get(from.tagVal);
        sources.forEach(function (source) {
            allQs.set(source.tagVal, new Queue_1.Queue());
        });
    };
    QPROPNode.prototype.contains = function (typeArray, targettype) {
        return typeArray.filter(function (type) {
            return type.tagVal == targettype.tagVal;
        }).length > 0;
    };
    ////////////////////////////////////////
    // Algorithm                        ///
    ///////////////////////////////////////
    QPROPNode.prototype.pickInit = function () {
        var _this = this;
        this.directParents.forEach(function (parentType) {
            _this.inputQueues.set(parentType.tagVal, new Map());
        });
        var check = function (ref) {
            ref.isReferenced(_this.ownType).then(function (b) {
                if (b) {
                    _this.initRegular();
                }
                else {
                    //console.log("Init dynamic for: " + this.ownType.tagVal)
                    _this.initDynamic();
                    _this.dynamic = true;
                }
            });
        };
        if (this.directParents.length == 0) {
            this.host.subscribe(this.directChildren[0]).once(function (childRef) {
                check(childRef);
            });
        }
        else {
            this.host.subscribe(this.directParents[0]).once(function (parentRef) {
                check(parentRef);
            });
        }
    };
    QPROPNode.prototype.initRegular = function () {
        var _this = this;
        this.directParents.forEach(function (parenType) {
            _this.host.subscribe(parenType).each(function (parentRef) {
                _this.directParentRefs.push(parentRef);
                _this.sendReady();
                if (_this.receivedAllParents() && _this.directChildren.length == 0) {
                    _this.directParentRefs.forEach(function (parentRef) {
                        parentRef.receiveStart(_this.ownType);
                    });
                    //console.log("Node : " + this.ownType.tagVal + " is ready !")
                }
            });
        });
        this.directChildren.forEach(function (childType) {
            _this.host.subscribe(childType).each(function (childRef) {
                _this.directChildrenRefs.push(childRef);
                if ((_this.directChildrenRefs.length == _this.directChildren.length) && _this.directParents.length == 0) {
                    _this.directChildrenRefs.forEach(function (childRef) {
                        childRef.receiveParents(_this.ownType, _this.getAllSources(), _this.ownDefault);
                    });
                }
                else {
                    _this.sendParents();
                }
            });
        });
    };
    QPROPNode.prototype.initDynamic = function () {
        var _this = this;
        var updateParents = function () {
            _this.directParentRefs.forEach(function (parentRef) {
                parentRef.addChild(_this);
            });
        };
        var updateChildren = function () {
            var childrenUpdated = 0;
            _this.directChildren.forEach(function (childType) {
                _this.host.subscribe(childType).each(function (childRef) {
                    _this.directChildrenRefs.push(childRef);
                    childRef.updateSources(_this.ownType, _this.getAllSources(), true, _this.ownDefault).then(function () {
                        childrenUpdated++;
                        if (childrenUpdated == _this.directChildren.length) {
                            updateParents();
                        }
                    });
                });
            });
        };
        var queuesConstructed = 0;
        this.directParents.forEach(function (parentType) {
            _this.host.subscribe(parentType).each(function (parentRef) {
                _this.directParentRefs.push(parentRef);
                parentRef.getDefaultValue().then(function (defVal) {
                    _this.directParentDefaultVals.set(parentType.tagVal, defVal);
                });
                parentRef.getSourceMap().then(function (sourceMap) {
                    var theseSources = _this.getAllSources().sources;
                    sourceMap.sources.forEach(function (source) {
                        var hasSource = _this.contains(theseSources, source);
                        var hasInstable = _this.contains(_this.instabilitySet, source);
                        if (hasSource && hasInstable) {
                            _this.instabilitySet.push(source);
                        }
                    });
                    _this.constructQueue(parentType, sourceMap.sources);
                    queuesConstructed++;
                    if (queuesConstructed == _this.directParents.length) {
                        updateChildren();
                    }
                });
            });
        });
        if (this.directParents.length == 0) {
            updateChildren();
        }
    };
    QPROPNode.prototype.dynamicDependencyAddition = function (change) {
        var _this = this;
        this.inputQueues.set(change.fromType.tagVal, new Map());
        this.directParents.push(change.fromType);
        this.host.subscribe(change.fromType).each(function (fromRef) {
            _this.directParentRefs.push(fromRef);
            fromRef.getDefaultValue().then(function (defVal) {
                _this.directParentDefaultVals.set(change.fromType.tagVal, defVal);
            });
            fromRef.getSourceMap().then(function (sourceMap) {
                var theseSources = _this.getAllSources().sources;
                sourceMap.sources.forEach(function (source) {
                    var hasSource = _this.contains(theseSources, source);
                    var hasInstable = _this.contains(_this.instabilitySet, source);
                    if (hasSource && hasInstable) {
                        _this.instabilitySet.push(source);
                    }
                });
                _this.constructQueue(change.fromType, sourceMap.sources);
                var childrenUpdated = 0;
                _this.directChildrenRefs.forEach(function (childRef) {
                    childRef.updateSources(_this.ownType, _this.getAllSources(), true, _this.ownDefault).then(function () {
                        childrenUpdated++;
                        if (childrenUpdated == _this.directChildren.length) {
                            fromRef.addChild(_this);
                        }
                    });
                });
            });
        });
    };
    QPROPNode.prototype.canPropagate = function (messageOrigin) {
        var propagate = true;
        var qs = [];
        this.inputQueues.forEach(function (qSet, parentType) {
            if (qSet.has(messageOrigin.tagVal)) {
                var q = qSet.get(messageOrigin.tagVal);
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
    };
    QPROPNode.prototype.canStabilise = function (qs, messageOrigin) {
        var commonStamps = [];
        var allStamps = [];
        var commonTimeStamp = false;
        qs.forEach(function (outerQ) {
            outerQ.peekAll(function (v) {
                var found = true;
                allStamps.push(v.timeStamp);
                qs.forEach(function (innerQ) {
                    if (outerQ != innerQ) {
                        found = found && (innerQ.contains(function (el) { return el.timeStamp == v.timeStamp; }));
                    }
                });
                if (found && (!commonStamps.includes(v.timeStamp))) {
                    commonStamps.push(v.timeStamp);
                }
                commonTimeStamp = commonTimeStamp || found;
            });
        });
        if (commonTimeStamp) {
            var lowest_1 = -1;
            commonStamps.forEach(function (stamp) {
                if (stamp < lowest_1 || lowest_1 < 0) {
                    lowest_1 = stamp;
                }
            });
            qs.forEach(function (q) {
                q.remove(function (val) {
                    return val.timeStamp >= lowest_1;
                });
            });
            this.instabilitySet = this.instabilitySet.filter(function (source) {
                return source.tagVal != messageOrigin.tagVal;
            });
        }
        return commonTimeStamp;
    };
    QPROPNode.prototype.getArgumentPosition = function (parentType) {
        var index = -1;
        this.directParents.forEach(function (parent, i) {
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
    };
    QPROPNode.prototype.getPropagationArguments = function (messageOrigin) {
        var _this = this;
        var args = new Array(this.directParents.length);
        this.inputQueues.forEach(function (qSet, parentType) {
            if (qSet.has(messageOrigin.tagVal)) {
                var q = qSet.get(messageOrigin.tagVal);
                args[_this.getArgumentPosition(parentType)] = q.deQueue().value;
            }
            else {
                if (_this.directParentLastKnownVals.has(parentType)) {
                    args[_this.getArgumentPosition(parentType)] = _this.directParentLastKnownVals.get(parentType);
                }
                else {
                    args[_this.getArgumentPosition(parentType)] = _this.directParentDefaultVals.get(parentType);
                }
            }
        });
        return args;
    };
    ////////////////////////////////////////
    // Calls made by other QPROP nodes  ///
    ///////////////////////////////////////
    QPROPNode.prototype.receiveStart = function (from) {
        this.startsReceived++;
        this.sendReady();
    };
    QPROPNode.prototype.receiveParents = function (from, sources, defaultValue) {
        this.parentsReceived++;
        this.directParentDefaultVals.set(from.tagVal, defaultValue);
        this.constructQueue(from, sources.sources);
        this.sendParents();
    };
    QPROPNode.prototype.receiveMessage = function (from, message) {
        var qSet = this.inputQueues.get(from.tagVal);
        var originQueue = qSet.get(message.origin.tagVal);
        originQueue.enQueue(message);
        this.directParentLastKnownVals.set(from.tagVal, message.value);
        var canPropagate = this.canPropagate(message.origin);
        if (canPropagate) {
            var args = this.getPropagationArguments(message.origin);
            //This will start propagation of local change. The exported signal will invoke the propagate method (which will send
            this.signalPool.setLastPropMessage(message);
            this.ownSignal.change(args);
            //THIS IS DIFFERENT FROM AT VERSION
            /*this.directChildrenRefs.forEach((childRef : FarRef)=>{
                childRef.receiveMessage(this.ownType,new PropagationValue(message.origin,this.ownSignal.v,message.timeStamp))
            })*/
        }
    };
    QPROPNode.prototype.isReferenced = function (someType) {
        return (this.contains(this.directParents, someType)) || (this.contains(this.directChildren, someType));
    };
    QPROPNode.prototype.addChild = function (childRef) {
        this.directChildrenRefs.push(childRef);
    };
    QPROPNode.prototype.getDefaultValue = function () {
        return this.ownDefault;
    };
    QPROPNode.prototype.updateSources = function (from, sourceMap, updateDef, defVal) {
        var _this = this;
        if (updateDef === void 0) { updateDef = false; }
        if (defVal === void 0) { defVal = null; }
        var sources = sourceMap.sources;
        var mySources = this.getAllSources().sources;
        sources.forEach(function (source) {
            if (_this.contains(mySources, source) && (!_this.contains(_this.instabilitySet, source))) {
                _this.instabilitySet.push(source);
            }
        });
        if (updateDef) {
            this.inputQueues.set(from.tagVal, new Map());
            this.directParentDefaultVals.set(from.tagVal, defVal);
            this.directParents.push(from);
        }
        this.constructQueue(from, sources);
        if (this.directChildrenRefs.length == 0) {
            return "ok";
        }
        else {
            var resReceived_1 = 0;
            return new Promise(function (resolve) {
                _this.directChildrenRefs.forEach(function (childRef) {
                    childRef.updateSources(_this.ownType, sourceMap).then(function () {
                        resReceived_1++;
                        if (resReceived_1 == _this.directChildrenRefs.length) {
                            resolve("ok");
                        }
                    });
                });
            });
        }
    };
    QPROPNode.prototype.getSourceMap = function () {
        return this.getAllSources();
    };
    QPROPNode.prototype.getSignal = function (signal) {
        //Dummy neeed to trigger underlying deserialisation of SpiderS.js
    };
    ////////////////////////////////////////
    // Calls made by Spiders.js          ///
    ///////////////////////////////////////
    QPROPNode.prototype.setSignalPool = function (signalPool) {
        this.signalPool = signalPool;
    };
    QPROPNode.prototype.publishSignal = function (signal) {
        var _this = this;
        var publish = function () {
            _this.directChildrenRefs.forEach(function (childRef) {
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
            signal.holder.onChangeListener = function () {
                _this.propagate(signal.holder, []);
            };
        }
    };
    //Called by spiders.js when exported signal must propagate
    QPROPNode.prototype.propagate = function (signal, toIds) {
        var _this = this;
        var that = this;
        var newVal = signal.value;
        if (newVal instanceof signal_1.SignalFunction) {
            newVal = newVal.lastVal;
        }
        var sendToAll = function () {
            if (signal.isSource) {
                _this.directChildrenRefs.forEach(function (childRef) {
                    childRef.receiveMessage(that.ownType, new PropagationValue(that.ownType, newVal, that.stampCounter));
                });
                _this.stampCounter++;
            }
            else {
                //Get the message which originally triggered the local propagation
                var propMessage_1 = _this.signalPool.lastPropMessage;
                _this.directChildrenRefs.forEach(function (childRef) {
                    childRef.receiveMessage(_this.ownType, new PropagationValue(propMessage_1.origin, newVal, propMessage_1.timeStamp));
                });
            }
        };
        if (this.startsReceived == this.directChildren.length || this.dynamic) {
            sendToAll();
        }
        else {
            this.readyListeners.push(sendToAll);
        }
    };
    //No need to implement this, QPROP overrides this behaviour
    QPROPNode.prototype.propagationReceived = function (fromId, signalId, value) {
        //Not needed
    };
    return QPROPNode;
}());
exports.QPROPNode = QPROPNode;
