var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 03/04/2017.
 */
var spiders = require("../../src/spiders");
var pubSub = require("../../src/PubSub/PubSub");
exports.GroceryTag = new pubSub.PubSubTag("Grocery");
class KV {
    put(key, val) {
        Reflect.set(this, key, val);
    }
    remove(key) {
        Reflect.deleteProperty(this, key);
    }
    get(key) {
        return Reflect.get(this, key);
    }
    has(key) {
        return Reflect.has(this, key);
    }
    //Added for debug, remove when comparing
    asString() {
        let ret = "";
        Reflect.ownKeys(this).forEach((key) => {
            let name = key.toString();
            let quantity = Reflect.get(this, key);
            ret = ret + name + ": " + quantity + "\n";
        });
        return ret;
    }
}
class GroceryField extends spiders.RepliqObjectField {
    update(updates) {
        var that = this;
        function canUpdate(update) {
            if (update.methodName == "put") {
                if (update.args[2] > 1) {
                    return that.tentative.has(update.args[0]);
                }
                else {
                    return !that.tentative.has(update.args[0]);
                }
            }
            else if (update.methodName == "delete") {
                return that.tentative.has(update.args[0]);
            }
            else {
                return true;
            }
        }
        updates.forEach((update) => {
            if (canUpdate(update)) {
                this.tentative[update.methodName](...update.args);
            }
        });
    }
}
var grocery = spiders.makeAnnotation(GroceryField);
class GroceryRepliq extends spiders.Repliq {
    constructor(name) {
        super();
        this.name = name;
        this.items = new KV();
        this.totalItems = 0;
    }
    addGrocery(name) {
        this.items.put(name, 1);
        this.totalItems = this.totalItems.read() + 1;
    }
    removeGrocery(name) {
        let quantity = this.items.get(name);
        this.items.delete(name);
        this.totalItems = this.totalItems.read() - quantity;
    }
    incGrocery(name) {
        let quantity = this.items.get(name);
        this.items.put(name, quantity + 1);
    }
    decGrocery(name) {
        let quantity = this.items.get(name);
        this.items.decItem(name, quantity - 1);
    }
}
__decorate([
    grocery
], GroceryRepliq.prototype, "items", void 0);
__decorate([
    spiders.Count
], GroceryRepliq.prototype, "totalItems", void 0);
__decorate([
    spiders.atomic
], GroceryRepliq.prototype, "addGrocery", null);
__decorate([
    spiders.atomic
], GroceryRepliq.prototype, "removeGrocery", null);
exports.GroceryRepliq = GroceryRepliq;
//# sourceMappingURL=GroceryListReps.js.map