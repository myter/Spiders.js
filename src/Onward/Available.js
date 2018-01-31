Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const Eventual_1 = require("./Eventual");
var _EV_KEY_ = Eventual_1._IS_EVENTUAL_KEY_;
var spiders = require("../spiders");
var _IS_AVAILABLE_KEY_ = "_IS_AVAILABLE_";
class Available extends spiders.SpiderIsolate {
    constructor() {
        let mirror = new AvailableMirror();
        super(mirror);
        this[_IS_AVAILABLE_KEY_] = true;
    }
}
exports.Available = Available;
class AvailableMirror extends spiders.SpiderIsolateMirror {
    checkArg(arg) {
        if (arg instanceof Array) {
            let wrongArgs = arg.filter(this.checkArg);
            return wrongArgs.length > 0;
        }
        else if (typeof arg == 'object') {
            //Does this look like I'm stupid ? Yes ! However undefined is not seen as a falsy value for filter while it is in the condition of an if ... go figure
            if (!(arg[_IS_AVAILABLE_KEY_] || arg[_EV_KEY_])) {
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
            let message = "Cannot pas non-available arguments to available method call: " + methodName;
            throw new Error(message);
        }
        else {
            return super.invoke(methodName, args);
        }
    }
    write(fieldName, value) {
        if (this.checkArg(value)) {
            throw new Error("Cannot assign non-available argument to available field: " + fieldName);
        }
        else {
            return super.write(fieldName, value);
        }
    }
}
exports.AvailableMirror = AvailableMirror;
let avScope = new utils_1.LexScope();
avScope.addElement("AvailableMirror", AvailableMirror);
avScope.addElement("_IS_AVAILABLE_KEY_", _IS_AVAILABLE_KEY_);
utils_1.bundleScope(Available, avScope);
let avMirrorScope = new utils_1.LexScope();
avMirrorScope.addElement("_IS_AVAILABLE_KEY_", _IS_AVAILABLE_KEY_);
avMirrorScope.addElement("_EV_KEY_", _EV_KEY_);
utils_1.bundleScope(AvailableMirror, avMirrorScope);
//# sourceMappingURL=Available.js.map