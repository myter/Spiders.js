/**
 * Created by flo on 30/03/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class FieldUpdate {
    constructor(fieldName) {
        this.fieldName = fieldName;
    }
}
exports.FieldUpdate = FieldUpdate;
class RepliqField {
    constructor(name) {
        this.commitListeners = [];
        this.tentativeListeners = [];
        this.name = name;
    }
    resetToCommit() {
        this.tentative = this.commited;
    }
    onCommit(callback) {
        this.commitListeners.push(callback);
    }
    triggerCommit() {
        this.commitListeners.forEach((callback) => {
            callback(this.commited);
        });
    }
    onTentative(callback) {
        this.tentativeListeners.push(callback);
    }
    triggerTentative() {
        this.tentativeListeners.forEach((callback) => {
            callback(this.tentative);
        });
    }
}
exports.RepliqField = RepliqField;
//# sourceMappingURL=RepliqField.js.map