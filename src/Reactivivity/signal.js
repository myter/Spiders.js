Object.defineProperty(exports, "__esModule", { value: true });
const serialisation_1 = require("../serialisation");
/**
 * Created by flo on 21/06/2017.
 */
var utils = require("../utils");
class Dependency {
    constructor(val, position) {
        this.value = val;
        this.position = position;
    }
}
class SignalDependency extends Dependency {
    constructor(signal, val, position) {
        super(val, position);
        this.signal = signal;
    }
}
exports.SignalDependency = SignalDependency;
class StaticDependency extends Dependency {
}
//Used to represent the state of a signal, provided to the programmer as "Signal"
class SignalValue {
    constructor() {
        this[serialisation_1.SignalContainer.checkSignalFuncKey] = true;
    }
    setHolder(holder) {
        this.holder = holder;
    }
}
SignalValue.IS_MUTATOR = "_IS_MUTATOR_";
SignalValue.GET_ORIGINAL = "_GET_ORIGINAL_";
SignalValue.IS_WRAPPED = "_IS_WRAPPED_";
SignalValue.LOWER_BOUND = "_LOWER_BOUND_";
SignalValue.UPPER_BOUND = "_UPPER_BOUND_";
SignalValue.WEAK_ANN = "_WEAK_ANN_";
exports.SignalValue = SignalValue;
function mutator(target, propertyKey, descriptor) {
    let originalMethod = descriptor.value;
    originalMethod[SignalValue.IS_MUTATOR] = true;
    return {
        value: originalMethod
    };
}
exports.mutator = mutator;
function lease(timeOut) {
    return function boundsDecorator(constructor) {
        return function NewAble(...args) {
            let sigObject = new constructor(...args);
            sigObject[SignalValue.LOWER_BOUND] = timeOut;
            sigObject[SignalValue.UPPER_BOUND] = -1;
            return sigObject;
        };
    };
}
exports.lease = lease;
function weak(constructor) {
    return function NewAble(...args) {
        let sigObject = new constructor(...args);
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
class SignalObject extends SignalValue {
    instantiateMeta(environment) {
        let methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        methodKeys.forEach((methodName) => {
            var property = Reflect.get(Object.getPrototypeOf(this), methodName);
            if (property[SignalValue.IS_MUTATOR] || environment.signalPool.isMutator(this.constructor.name.toString(), methodName.toString())) {
                if (!property[SignalValue.IS_WRAPPED]) {
                    let wrapped = (...args) => {
                        property.apply(this, args, this);
                        this.holder.change();
                    };
                    wrapped[SignalValue.IS_MUTATOR] = true;
                    wrapped[SignalValue.GET_ORIGINAL] = property;
                    wrapped[SignalValue.IS_WRAPPED] = true;
                    Object.getPrototypeOf(this)[methodName] = wrapped;
                }
                else {
                    //Re-wrap (to have correct this pointer)
                    let original = property[SignalValue.GET_ORIGINAL];
                    let wrapped = (...args) => {
                        original.apply(this, args, this);
                        this.holder.change();
                    };
                    wrapped[SignalValue.IS_MUTATOR] = true;
                    wrapped[SignalValue.GET_ORIGINAL] = original;
                    wrapped[SignalValue.IS_WRAPPED] = true;
                    Object.getPrototypeOf(this)[methodName] = wrapped;
                }
            }
        });
    }
}
exports.SignalObject = SignalObject;
class SignalFunction extends SignalValue {
    constructor(f) {
        super();
        this.f = f;
    }
    reeval(...args) {
        this.lastVal = this.f(...args);
        return this.lastVal;
    }
}
exports.SignalFunction = SignalFunction;
class Signal {
    constructor(signalObject, isGarbage = false) {
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
    addChild(signal) {
        this.children.set(signal.id, signal);
    }
    addGarbageChild(signal) {
        this.garbageChildren.set(signal.id, signal);
    }
    removeChild(signalId) {
        this.children.delete(signalId);
    }
    removeGarbageChild(signalId) {
        this.children.delete(signalId);
    }
    addSignalDependency(signal, position) {
        this.signalDependencies.set(signal.id, new SignalDependency(signal, signal.value, position));
        this.isSource = false;
    }
    addStaticDependency(value, position) {
        this.staticDependencies.push(new StaticDependency(value, position));
        this.isSource = false;
    }
    addGarbageSignalDependency(signal, position) {
        this.garbageSignalDependencies.set(signal.id, new SignalDependency(signal, signal.value, position));
    }
    addGarbageStaticDependency(value, position) {
        this.garbageStaticDependencies.push(new StaticDependency(value, position));
    }
    //Signals is made weak by current actor. In case it is published it must be weak as well (hence tempStrong = false)
    makeWeak() {
        this.strong = false;
        this.tempStrong = false;
    }
    //Used to indicate that signal should be transferred weakly, but must remain strong for sender
    makeTempWeak() {
        this.tempStrong = false;
    }
    //Called on source nodes by "external" code
    change(val = null) {
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
    }
    propagate(val) {
        this.children.forEach((child) => {
            child.parentChanged(this.id, val);
        });
    }
    propagateGarbage(val = undefined) {
        let ret = true;
        this.garbageChildren.forEach((child) => {
            ret = ret && child.parentGarbageCollected(this.id, val);
        });
        return ret;
    }
    triggerExternal() {
        if (this.onChangeListener) {
            this.onChangeListener();
        }
    }
    parentChanged(parentId, val) {
        this.changesReceived += 1;
        let dependency = this.signalDependencies.get(parentId);
        if (val == Signal.NO_CHANGE) {
            this.noChangesReceived += 1;
        }
        else {
            dependency.value = val;
        }
        if (this.changesReceived == this.signalDependencies.size && this.noChangesReceived != this.signalDependencies.size) {
            let args = [];
            this.signalDependencies.forEach((dep) => {
                args[dep.position] = dep.value;
            });
            this.staticDependencies.forEach((dep) => {
                args[dep.position] = dep.value;
            });
            //If the signal has parents it cannot be source and must therefore have a function as value object
            let ret = this.value.reeval(...args);
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
    }
    //Return indicates whether propagation happened fully, in which case signal pool will collect all garbage nodes as well
    parentGarbageCollected(parentId, val = undefined) {
        this.changesReceived++;
        if (this.changesReceived == this.garbageSignalDependencies.size) {
            let args = [];
            let dependency = this.garbageSignalDependencies.get(parentId);
            dependency.value = val;
            this.garbageSignalDependencies.forEach((dep) => {
                //Garbage dependencies do not propagate values (simply propagate the "undefined" event)
                args[dep.position] = dep.value;
            });
            this.garbageStaticDependencies.forEach((dep) => {
                args[dep.position] = dep.value;
            });
            let ret = this.value.reeval(...args);
            return this.propagateGarbage(ret);
        }
        else {
            return false;
        }
    }
    //Used by Spiders.js to notify remote signals of a change
    registerOnChangeListener(callback) {
        this.onChangeListener = callback;
    }
    //Used by spiders.js to notify remote signal of garbage collection
    registerOnDeleteListener(callback) {
        this.onDeleteListeners.push(callback);
    }
    //Trigger garbage collection propagation (notify remote signal of destruction, not garbage value propagation)
    triggerOnDelete() {
        this.onDeleteListeners.forEach((callback) => {
            callback();
        });
    }
}
Signal.NO_CHANGE = "_NO_CHANGE_";
exports.Signal = Signal;
function lift(func) {
    return (...args) => {
        let sig = new Signal(new SignalFunction(func));
        let lowerBound = Infinity;
        let upperBound = -Infinity;
        args.forEach((a, i) => {
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
    return (...args) => {
        let sig = new Signal(new SignalFunction(func), true);
        sig.rateLowerBound = -1;
        sig.rateUpperBound = -1;
        args.forEach((a, i) => {
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
//# sourceMappingURL=signal.js.map