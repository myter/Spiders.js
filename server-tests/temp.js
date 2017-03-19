var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const RepliqField_1 = require("../src/Replication/RepliqField");
var spiders = require("../src/spiders");
class TestField extends RepliqField_1.RepliqField {
    update(updates) {
        console.log("Updates received : " + updates.length);
    }
}
class TestRepliq extends spiders.Repliq {
    constructor() {
        super();
        this.reg = new RepliqField_1.RepliqCountField("reg", 1);
        this.t = new TestField("t", 0);
    }
    setReg(val) {
        this.reg = val;
    }
    updateT() {
        this.t = 5;
        this.t = 6;
        this.t = 7;
    }
}
__decorate([
    spiders.atomic
], TestRepliq.prototype, "updateT", null);
class TestApp extends spiders.Application {
    createAndSend(actRef) {
        this.testRepliq = this.newRepliq(TestRepliq);
        actRef.getRepliq(this.testRepliq);
    }
}
var app = new TestApp();
class TestActor extends spiders.Actor {
    getRepliq(repliq) {
        this.myRepliq = repliq;
        this.myRepliq.setReg("It worked !");
    }
    testAtomicUpdate() {
        this.myRepliq.updateT();
    }
}
var act = app.spawnActor(TestActor);
app.createAndSend(act);
console.log("Value in app: " + app.testRepliq.reg);
setTimeout(() => {
    console.log("Value in app: " + app.testRepliq.reg);
    setTimeout(() => {
        act.testAtomicUpdate();
    }, 1000);
}, 4000);
//# sourceMappingURL=temp.js.map