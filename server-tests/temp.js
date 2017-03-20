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
class TestApp extends spiders.Application {
    constructor() {
        super();
        this.repliq = this.newRepliq(TestRepliq);
    }
}
var app = new TestApp();
class TestActor extends spiders.Actor {
    getRepliq(replica) {
        this.myReplica = replica;
    }
    update(val) {
        this.myReplica.setFoo(val);
    }
    updateBar(val) {
        this.myReplica.setBar(val);
    }
}
var act = app.spawnActor(TestActor);
act.getRepliq(app.repliq);
console.log("Foo Value before : " + app.repliq.foo);
setTimeout(() => {
    act.update(10);
    setTimeout(() => {
        console.log("Foo Value after: " + app.repliq.foo);
    }, 2000);
}, 1000);
console.log("Bar Value before : " + app.repliq.bar);
setTimeout(() => {
    act.updateBar(10);
    setTimeout(() => {
        console.log("Bar Value after: " + app.repliq.bar);
    }, 2000);
}, 1000);
//# sourceMappingURL=temp.js.map