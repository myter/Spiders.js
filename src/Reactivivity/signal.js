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
    constructor(signalId, val, position) {
        super(val, position);
        this.signalId = signalId;
    }
}
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
exports.SignalValue = SignalValue;
function mutator(target, propertyKey, descriptor) {
    let originalMethod = descriptor.value;
    originalMethod[SignalValue.IS_MUTATOR] = true;
    return {
        value: originalMethod
    };
}
exports.mutator = mutator;
class SignalObject extends SignalValue {
    instantiateMeta() {
        let methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        methodKeys.forEach((methodName) => {
            var property = Reflect.get(Object.getPrototypeOf(this), methodName);
            if (property[SignalValue.IS_MUTATOR]) {
                let wrapped = (...args) => {
                    property.apply(this, args, this);
                    this.holder.change();
                };
                wrapped[SignalValue.IS_MUTATOR] = true;
                wrapped[SignalValue.GET_ORIGINAL] = property;
                Object.getPrototypeOf(this)[methodName] = wrapped;
            }
        });
    }
    reconstruct() {
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
    constructor(signalObject) {
        //this[SignalContainer.checkSignalFuncKey]    = true
        this.id = utils.generateId();
        this.value = signalObject;
        this.children = new Array();
        this.signalDependencies = new Map();
        this.staticDependencies = new Array();
        this.changesReceived = 0;
        this.noChangesReceived = 0;
        this.listeners = new Array();
        this.rateLowerBound = Infinity;
        this.rateUpperBound = Infinity;
        this.isSource = true;
    }
    addChild(signal) {
        this.children.push(signal);
    }
    addSignalDependency(signal, position) {
        this.signalDependencies.set(signal.id, new SignalDependency(signal.id, signal.value, position));
        this.isSource = false;
    }
    addStaticDependency(value, position) {
        this.staticDependencies.push(new StaticDependency(value, position));
        this.isSource = false;
    }
    //Called on source nodes by "external" code
    change(val = null) {
        if (val == Signal.NO_CHANGE) {
            this.propagate(val);
        }
        else if (val instanceof SignalFunction) {
            this.value.lastVal = val.lastVal;
            this.propagate(val.lastVal);
            this.triggerExternal();
        }
        else if (val instanceof SignalObject) {
            this.value = val;
            this.propagate(this.value);
            this.triggerExternal();
        }
        else {
            this.propagate(this.value);
            this.triggerExternal();
        }
    }
    propagate(val) {
        this.children.forEach((child) => {
            child.parentChanged(this.id, val);
        });
    }
    triggerExternal() {
        this.listeners.forEach((listener) => {
            listener();
        });
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
            //TODO check whether ret is an object. If this is the case, turn it into SignalObjectValue
            this.changesReceived = 0;
            this.noChangesReceived = 0;
            this.triggerExternal();
            this.propagate(ret);
        }
        else if (this.noChangesReceived == this.signalDependencies.size) {
            this.noChangesReceived = 0;
            this.changesReceived = 0;
            this.propagate(Signal.NO_CHANGE);
        }
    }
    //Used by Spiders.js to notify remote signals of a change
    registerListener(callback) {
        this.listeners.push(callback);
    }
}
Signal.NO_CHANGE = "_NO_CHANGE_";
exports.Signal = Signal;
function lift(func) {
    return (...args) => {
        let sig = new Signal(new SignalFunction(func));
        args.forEach((a, i) => {
            if (a instanceof SignalValue) {
                a.holder.addChild(sig);
                sig.addSignalDependency(a.holder, i);
            }
            else {
                sig.addStaticDependency(a, i);
            }
        });
        return sig;
    };
}
exports.lift = lift;
//# sourceMappingURL=signal.js.map