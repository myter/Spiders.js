var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const RepliqField_1 = require("../src/Replication/RepliqField");
var spiders = require("../src/spiders");
class TestRepliq extends spiders.Repliq {
    constructor() {
        super();
        this.foo = 1;
        this.bar = 5;
    }
    setFoo(val) {
        this.foo = val;
    }
    setBar(val) {
        this.bar = val;
    }
}
__decorate([
    RepliqField_1.Count
], TestRepliq.prototype, "foo", void 0);
__decorate([
    RepliqField_1.LWR
], TestRepliq.prototype, "bar", void 0);
__decorate([
    spiders.atomic
], TestRepliq.prototype, "setFoo", null);
var app = new spiders.Application();
function foo() {
}
class TestActor extends spiders.Actor {
    constructor() {
        super();
        this.TestRepliq = TestRepliq;
    }
    init() {
        this.newRepliq(this.TestRepliq);
    }
}
app.spawnActor(TestActor);
//# sourceMappingURL=temp.js.map