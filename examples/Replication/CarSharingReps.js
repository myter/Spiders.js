var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 04/04/2017.
 */
var spiders = require("../../src/spiders");
var pubsub = require("../../src/PubSub/PubSub");
exports.PlatformTag = new pubsub.PubSubTag("Platform");
exports.CustomerTag = new pubsub.PubSubTag("Customer");
class StrongField extends spiders.RepliqPrimitiveField {
    read() {
        return this.commited;
    }
}
var Strong = spiders.makeAnnotation(StrongField);
class ImmutableField extends spiders.RepliqPrimitiveField {
    update(updates) {
        throw new Error("Mutation of immutable fields dissalowed");
    }
}
var Immutable = spiders.makeAnnotation(ImmutableField);
class PlatformRepliq extends spiders.Repliq {
    constructor() {
        super();
        this.customerCount = 0;
        this.cars = {};
        this.availableCars = 10;
    }
}
__decorate([
    spiders.Count
], PlatformRepliq.prototype, "customerCount", void 0);
__decorate([
    Strong
], PlatformRepliq.prototype, "availableCars", void 0);
exports.PlatformRepliq = PlatformRepliq;
class CustomerRepliq extends spiders.Repliq {
}
__decorate([
    Immutable
], CustomerRepliq.prototype, "id", void 0);
exports.CustomerRepliq = CustomerRepliq;
//# sourceMappingURL=CarSharingReps.js.map