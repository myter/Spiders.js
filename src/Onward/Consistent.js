Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
var spiders = require("../spiders");
var _IS_CONSISTENT_KEY_ = "_IS_CONSISTENT_";
class Consistent extends spiders.SpiderObject {
    constructor() {
        super(new ConsistentMirror());
        this[_IS_CONSISTENT_KEY_] = true;
    }
}
exports.Consistent = Consistent;
class ConsistentMirror extends spiders.SpiderObjectMirror {
    checkArg(arg) {
        if (arg instanceof Array) {
            let wrongArgs = arg.filter((a) => {
                return this.checkArg(a);
            });
            return wrongArgs.length > 0;
        }
        else if (typeof arg == 'object') {
            //Does this look like I'm stupid ? Yes ! However undefined is not seen as a falsy value for filter while it is in the condition of an if ... go figure
            if (!arg[_IS_CONSISTENT_KEY_]) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    invoke(methodName, args) {
        let wrongArgs = args.filter(this.checkArg);
        if (wrongArgs.length > 0) {
            let message = "Cannot pas non-consistent arguments to consistent method call: " + methodName;
            throw new Error(message);
        }
        else {
            return super.invoke(methodName, args);
        }
    }
    write(fieldName, value) {
        if (this.checkArg(value)) {
            throw new Error("Cannot assign non-consistent argument to consistent field");
        }
        else {
            return super.write(fieldName, value);
        }
    }
}
exports.ConsistentMirror = ConsistentMirror;
let consScope = new utils_1.LexScope();
consScope.addElement("ConsistentMirror", ConsistentMirror);
consScope.addElement("_IS_CONSISTENT_KEY_", _IS_CONSISTENT_KEY_);
utils_1.bundleScope(Consistent, consScope);
let conMirrorScope = new utils_1.LexScope();
conMirrorScope.addElement("_IS_CONSISTENT_KEY_", _IS_CONSISTENT_KEY_);
utils_1.bundleScope(ConsistentMirror, conMirrorScope);
//# sourceMappingURL=Consistent.js.map