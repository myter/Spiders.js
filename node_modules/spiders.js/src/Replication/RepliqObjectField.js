Object.defineProperty(exports, "__esModule", { value: true });
const RepliqField_1 = require("./RepliqField");
/**
 * Created by flo on 30/03/2017.
 */
class ObjectFieldUpdate extends RepliqField_1.FieldUpdate {
    constructor(fieldName, methodName, args) {
        super(fieldName);
        this.methodName = methodName;
        this.args = args;
    }
}
exports.ObjectFieldUpdate = ObjectFieldUpdate;
class RepliqObjectField extends RepliqField_1.RepliqField {
    read() {
        return this.tentative;
    }
    writeField(newValue) {
        //TODO should not happen, throw exception
    }
    methodInvoked(methodName, args) {
        this.tentative[methodName](...args);
    }
    commit() {
        this.commited = this.utils.clone(this.tentative);
        this.triggerCommit();
    }
    update(updates) {
        updates.forEach((update) => {
            this.methodInvoked(update.methodName, update.args);
        });
        this.triggerTentative();
    }
    constructor(name, value) {
        super(name);
        this.tentative = value;
        this.utils = require("../utils");
        this.commited = this.utils.clone(value);
    }
}
exports.RepliqObjectField = RepliqObjectField;
//# sourceMappingURL=RepliqObjectField.js.map