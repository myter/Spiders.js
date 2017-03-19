const RepliqField_1 = require("../src/Replication/RepliqField");
var spiders = require("../src/spiders");
class TestRepliq extends spiders.Repliq {
    constructor() {
        super();
        this.reg = new RepliqField_1.RepliqCountField("reg", 1);
    }
    setReg(val) {
        this.reg = val;
    }
}
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
}
var act = app.spawnActor(TestActor);
app.createAndSend(act);
console.log("Value in app: " + app.testRepliq.reg);
setTimeout(() => {
    console.log("Value in app: " + app.testRepliq.reg);
}, 4000);
//# sourceMappingURL=temp.js.map