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
class Signal {
    constructor(initVal, evalFunc = null) {
        this[serialisation_1.SignalContainer.checkSignalFuncKey] = true;
        this.id = utils.generateId();
        this.currentVal = initVal;
        this.evalFunc = evalFunc;
        this.children = new Array();
        this.signalDependencies = new Map();
        this.staticDependencies = new Array();
        this.changesReceived = 0;
    }
    addChild(signal) {
        this.children.push(signal);
    }
    addSignalDependency(signal, position) {
        this.signalDependencies.set(signal.id, new SignalDependency(signal.id, signal.currentVal, position));
    }
    addStaticDependency(value, position) {
        this.staticDependencies.push(new StaticDependency(value, position));
    }
    //Called on source nodes by "external" code
    change(val) {
        this.propagate(val);
    }
    propagate(val) {
        this.children.forEach((child) => {
            child.parentChanged(this.id, val);
        });
    }
    parentChanged(parentId, val) {
        this.signalDependencies.get(parentId).value = val;
        this.changesReceived += 1;
        if (this.changesReceived == this.signalDependencies.size) {
            let args = [];
            this.signalDependencies.forEach((dep) => {
                args[dep.position] = dep.value;
            });
            this.staticDependencies.forEach((dep) => {
                args[dep.position] = dep.value;
            });
            this.currentVal = this.evalFunc(...args);
            this.changesReceived = 0;
            this.propagate(this.currentVal);
        }
    }
}
exports.Signal = Signal;
function lift(func) {
    return (...args) => {
        let sig = new Signal(null, func);
        let unwrappedArgs = [];
        args.forEach((a, i) => {
            if (a instanceof Signal) {
                a.addChild(sig);
                sig.addSignalDependency(a, i);
                unwrappedArgs.push(a.currentVal);
            }
            else {
                sig.addStaticDependency(a, i);
                unwrappedArgs.push(a);
            }
        });
        //func(... unwrappedArgs)
        return sig;
    };
}
exports.lift = lift;
//# sourceMappingURL=signal.js.map