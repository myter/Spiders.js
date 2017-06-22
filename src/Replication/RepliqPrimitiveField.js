Object.defineProperty(exports, "__esModule", { value: true });
const RepliqField_1 = require("./RepliqField");
/**
 * Created by flo on 16/03/2017.
 */
class PrimitiveFieldUpdate extends RepliqField_1.FieldUpdate {
    constructor(fieldName, initVal, resVal) {
        super(fieldName);
        this.initVal = initVal;
        this.resVal = resVal;
    }
}
exports.PrimitiveFieldUpdate = PrimitiveFieldUpdate;
class RepliqPrimitiveField extends RepliqField_1.RepliqField {
    constructor(name, value) {
        super(name);
        this.tentative = value;
        this.commited = value;
    }
    read() {
        return this.tentative;
    }
    writeField(newValue) {
        this.tentative = newValue;
    }
    commit() {
        this.commited = this.tentative;
        this.triggerCommit();
    }
    update(updates) {
        updates.forEach((update) => {
            this.tentative = update.resVal;
        });
        this.triggerTentative();
    }
}
exports.RepliqPrimitiveField = RepliqPrimitiveField;
exports.fieldMetaData = new Map();
function makeAnnotation(fieldClass) {
    return function (target, propertyKey) {
        exports.fieldMetaData.set(propertyKey, fieldClass);
    };
}
exports.makeAnnotation = makeAnnotation;
class RepliqCountField extends RepliqPrimitiveField {
    update(updates) {
        let inc = 0;
        updates.forEach((update) => {
            inc += (update.resVal - update.initVal);
        });
        this.tentative += inc;
        this.triggerTentative();
    }
}
exports.RepliqCountField = RepliqCountField;
exports.LWR = makeAnnotation(RepliqPrimitiveField);
exports.Count = makeAnnotation(RepliqCountField);
//# sourceMappingURL=RepliqPrimitiveField.js.map