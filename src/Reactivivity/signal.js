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
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
/**
 * Created by flo on 21/06/2017.
 */
var utils = require("../utils");
var Dependency = (function () {
    function Dependency(val, position) {
        this.value = val;
        this.position = position;
    }
    return Dependency;
}());
var SignalDependency = (function (_super) {
    __extends(SignalDependency, _super);
    function SignalDependency(signal, val, position) {
        var _this = _super.call(this, val, position) || this;
        _this.signal = signal;
        return _this;
    }
    return SignalDependency;
}(Dependency));
exports.SignalDependency = SignalDependency;
var StaticDependency = (function (_super) {
    __extends(StaticDependency, _super);
    function StaticDependency() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StaticDependency;
}(Dependency));
//Used to represent the state of a signal, provided to the programmer as "Signal"
var SignalValue = (function () {
    function SignalValue() {
        this[serialisation_1.SignalContainer.checkSignalFuncKey] = true;
    }
    SignalValue.prototype.setHolder = function (holder) {
        this.holder = holder;
    };
    SignalValue.IS_MUTATOR = "_IS_MUTATOR_";
    SignalValue.GET_ORIGINAL = "_GET_ORIGINAL_";
    SignalValue.IS_WRAPPED = "_IS_WRAPPED_";
    SignalValue.LOWER_BOUND = "_LOWER_BOUND_";
    SignalValue.UPPER_BOUND = "_UPPER_BOUND_";
    SignalValue.WEAK_ANN = "_WEAK_ANN_";
    return SignalValue;
}());
exports.SignalValue = SignalValue;
function mutator(target, propertyKey, descriptor) {
    var originalMethod = descriptor.value;
    originalMethod[SignalValue.IS_MUTATOR] = true;
    return {
        value: originalMethod
    };
}
exports.mutator = mutator;
function lease(timeOut) {
    return function boundsDecorator(constructor) {
        return function NewAble() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var sigObject = new (constructor.bind.apply(constructor, [void 0].concat(args)))();
            sigObject[SignalValue.LOWER_BOUND] = timeOut;
            sigObject[SignalValue.UPPER_BOUND] = -1;
            return sigObject;
        };
    };
}
exports.lease = lease;
function weak(constructor) {
    return function NewAble() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var sigObject = new (constructor.bind.apply(constructor, [void 0].concat(args)))();
        sigObject[SignalValue.WEAK_ANN] = true;
        return sigObject;
    };
}
exports.weak = weak;
//strong is the default, so doesn't do anything but there for consistencies sake
function strong(constructor) {
    return constructor;
}
exports.strong = strong;
var SignalObject = (function (_super) {
    __extends(SignalObject, _super);
    function SignalObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SignalObject.prototype.instantiateMeta = function (environment) {
        var _this = this;
        var methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        methodKeys.forEach(function (methodName) {
            var property = Reflect.get(Object.getPrototypeOf(_this), methodName);
            if (property[SignalValue.IS_MUTATOR] || environment.signalPool.isMutator(_this.constructor.name.toString(), methodName.toString())) {
                if (!property[SignalValue.IS_WRAPPED]) {
                    var wrapped = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        property.apply(_this, args, _this);
                        _this.holder.change();
                    };
                    wrapped[SignalValue.IS_MUTATOR] = true;
                    wrapped[SignalValue.GET_ORIGINAL] = property;
                    wrapped[SignalValue.IS_WRAPPED] = true;
                    Object.getPrototypeOf(_this)[methodName] = wrapped;
                }
                else {
                    //Re-wrap (to have correct this pointer)
                    var original_1 = property[SignalValue.GET_ORIGINAL];
                    var wrapped = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        original_1.apply(_this, args, _this);
                        _this.holder.change();
                    };
                    wrapped[SignalValue.IS_MUTATOR] = true;
                    wrapped[SignalValue.GET_ORIGINAL] = original_1;
                    wrapped[SignalValue.IS_WRAPPED] = true;
                    Object.getPrototypeOf(_this)[methodName] = wrapped;
                }
            }
        });
    };
    return SignalObject;
}(SignalValue));
exports.SignalObject = SignalObject;
var SignalFunction = (function (_super) {
    __extends(SignalFunction, _super);
    function SignalFunction(f) {
        var _this = _super.call(this) || this;
        _this.f = f;
        return _this;
    }
    SignalFunction.prototype.reeval = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.lastVal = this.f.apply(this, args);
        return this.lastVal;
    };
    return SignalFunction;
}(SignalValue));
exports.SignalFunction = SignalFunction;
var Signal = (function () {
    function Signal(signalObject, isGarbage) {
        if (isGarbage === void 0) { isGarbage = false; }
        //this[SignalContainer.checkSignalFuncKey]    = true
        this.id = utils.generateId();
        this.value = signalObject;
        this.children = new Map();
        this.garbageChildren = new Map();
        this.signalDependencies = new Map();
        this.staticDependencies = new Array();
        this.garbageSignalDependencies = new Map();
        this.garbageStaticDependencies = new Array();
        this.changesReceived = 0;
        this.noChangesReceived = 0;
        this.onDeleteListeners = new Array();
        this.clock = 0;
        this.isGarbage = isGarbage;
        if (Reflect.has(signalObject, SignalValue.LOWER_BOUND)) {
            this.rateLowerBound = signalObject[SignalValue.LOWER_BOUND];
            this.rateUpperBound = signalObject[SignalValue.UPPER_BOUND];
        }
        else {
            this.rateLowerBound = -1;
            this.rateUpperBound = -1;
        }
        this.isSource = true;
        if (Reflect.has(signalObject, SignalValue.WEAK_ANN)) {
            this.strong = false;
            this.tempStrong = false;
        }
        else {
            this.strong = true;
            this.tempStrong = true;
        }
        if (isGarbage) {
            this.strong = false;
            this.tempStrong = false;
        }
    }
    Signal.prototype.addChild = function (signal) {
        this.children.set(signal.id, signal);
    };
    Signal.prototype.addGarbageChild = function (signal) {
        this.garbageChildren.set(signal.id, signal);
    };
    Signal.prototype.removeChild = function (signalId) {
        this.children.delete(signalId);
    };
    Signal.prototype.removeGarbageChild = function (signalId) {
        this.children.delete(signalId);
    };
    Signal.prototype.addSignalDependency = function (signal, position) {
        this.signalDependencies.set(signal.id, new SignalDependency(signal, signal.value, position));
        this.isSource = false;
    };
    Signal.prototype.addStaticDependency = function (value, position) {
        this.staticDependencies.push(new StaticDependency(value, position));
        this.isSource = false;
    };
    Signal.prototype.addGarbageSignalDependency = function (signal, position) {
        this.garbageSignalDependencies.set(signal.id, new SignalDependency(signal, signal.value, position));
    };
    Signal.prototype.addGarbageStaticDependency = function (value, position) {
        this.garbageStaticDependencies.push(new StaticDependency(value, position));
    };
    //Signals is made weak by current actor. In case it is published it must be weak as well (hence tempStrong = false)
    Signal.prototype.makeWeak = function () {
        this.strong = false;
        this.tempStrong = false;
    };
    //Used to indicate that signal should be transferred weakly, but must remain strong for sender
    Signal.prototype.makeTempWeak = function () {
        this.tempStrong = false;
    };
    //Called on source nodes by "external" code
    Signal.prototype.change = function (val) {
        if (val === void 0) { val = null; }
        if (val == Signal.NO_CHANGE) {
            this.propagate(val);
        }
        else if (val instanceof SignalFunction) {
            this.clock++;
            this.value.lastVal = val.lastVal;
            this.propagate(val.lastVal);
            this.triggerExternal();
        }
        else if (val instanceof SignalObject) {
            this.clock++;
            this.value = val;
            this.propagate(this.value);
            this.triggerExternal();
        }
        else {
            this.clock++;
            this.propagate(this.value);
            this.triggerExternal();
        }
    };
    Signal.prototype.propagate = function (val) {
        var _this = this;
        this.children.forEach(function (child) {
            child.parentChanged(_this.id, val);
        });
    };
    Signal.prototype.propagateGarbage = function (val) {
        var _this = this;
        if (val === void 0) { val = undefined; }
        var ret = true;
        this.garbageChildren.forEach(function (child) {
            ret = ret && child.parentGarbageCollected(_this.id, val);
        });
        return ret;
    };
    Signal.prototype.triggerExternal = function () {
        if (this.onChangeListener) {
            this.onChangeListener();
        }
    };
    Signal.prototype.parentChanged = function (parentId, val) {
        this.changesReceived += 1;
        var dependency = this.signalDependencies.get(parentId);
        if (val == Signal.NO_CHANGE) {
            this.noChangesReceived += 1;
        }
        else {
            dependency.value = val;
        }
        if (this.changesReceived == this.signalDependencies.size && this.noChangesReceived != this.signalDependencies.size) {
            var args_1 = [];
            this.signalDependencies.forEach(function (dep) {
                args_1[dep.position] = dep.value;
            });
            this.staticDependencies.forEach(function (dep) {
                args_1[dep.position] = dep.value;
            });
            //If the signal has parents it cannot be source and must therefore have a function as value object
            var ret = (_a = this.value).reeval.apply(_a, args_1);
            this.changesReceived = 0;
            this.noChangesReceived = 0;
            this.clock++;
            this.triggerExternal();
            this.propagate(ret);
        }
        else if (this.noChangesReceived == this.signalDependencies.size) {
            this.noChangesReceived = 0;
            this.changesReceived = 0;
            this.propagate(Signal.NO_CHANGE);
        }
        var _a;
    };
    //Return indicates whether propagation happened fully, in which case signal pool will collect all garbage nodes as well
    Signal.prototype.parentGarbageCollected = function (parentId, val) {
        if (val === void 0) { val = undefined; }
        this.changesReceived++;
        if (this.changesReceived == this.garbageSignalDependencies.size) {
            var args_2 = [];
            var dependency = this.garbageSignalDependencies.get(parentId);
            dependency.value = val;
            this.garbageSignalDependencies.forEach(function (dep) {
                //Garbage dependencies do not propagate values (simply propagate the "undefined" event)
                args_2[dep.position] = dep.value;
            });
            this.garbageStaticDependencies.forEach(function (dep) {
                args_2[dep.position] = dep.value;
            });
            var ret = (_a = this.value).reeval.apply(_a, args_2);
            return this.propagateGarbage(ret);
        }
        else {
            return false;
        }
        var _a;
    };
    //Used by Spiders.js to notify remote signals of a change
    Signal.prototype.registerOnChangeListener = function (callback) {
        this.onChangeListener = callback;
    };
    //Used by spiders.js to notify remote signal of garbage collection
    Signal.prototype.registerOnDeleteListener = function (callback) {
        this.onDeleteListeners.push(callback);
    };
    //Trigger garbage collection propagation (notify remote signal of destruction, not garbage value propagation)
    Signal.prototype.triggerOnDelete = function () {
        this.onDeleteListeners.forEach(function (callback) {
            callback();
        });
    };
    Signal.NO_CHANGE = "_NO_CHANGE_";
    return Signal;
}());
exports.Signal = Signal;
function lift(func) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var sig = new Signal(new SignalFunction(func));
        var lowerBound = Infinity;
        var upperBound = -Infinity;
        args.forEach(function (a, i) {
            if (a instanceof SignalValue) {
                a.holder.addChild(sig);
                sig.addSignalDependency(a.holder, i);
                if (a.holder.rateLowerBound > 0) {
                    lowerBound = Math.min(lowerBound, a.holder.rateLowerBound);
                    upperBound = Math.max(upperBound, a.holder.rateUpperBound);
                }
            }
            else {
                sig.addStaticDependency(a, i);
            }
        });
        sig.rateLowerBound = lowerBound;
        sig.rateUpperBound = upperBound;
        return sig;
    };
}
exports.lift = lift;
function liftGarbage(func) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var sig = new Signal(new SignalFunction(func), true);
        sig.rateLowerBound = -1;
        sig.rateUpperBound = -1;
        args.forEach(function (a, i) {
            if (a instanceof SignalValue) {
                a.holder.addGarbageChild(sig);
                sig.addGarbageSignalDependency(a.holder, i);
            }
            else {
                sig.addGarbageStaticDependency(a, i);
            }
        });
        return sig;
    };
}
exports.liftGarbage = liftGarbage;
