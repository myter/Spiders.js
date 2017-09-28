Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TestRep extends spiders.Repliq {
    constructor() {
        super();
        this.val = 1;
    }
    inc() {
        console.log("Inced");
        this.val = 66;
    }
}
class TestApp extends spiders.Application {
    constructor() {
        super();
        this.rep = this.newRepliq(TestRep);
    }
}
class TestActor extends spiders.Actor {
    getRep(rep) {
        console.log("Got rep");
        this.rep = rep;
        rep.val.onCommit(() => {
            console.log("New rep val: " + rep.val);
        });
    }
    getVal() {
        return this.rep.val.valueOf();
    }
}
let app = new TestApp();
let act = app.spawnActor(TestActor);
act.getRep(app.rep);
app.rep.inc();
setTimeout(() => {
    act.getVal().then((v) => {
        console.log("Value = " + v);
    });
}, 2000);
/*function update(){
    setTimeout(()=>{
        app.rep.inc()
        update()
    },2000)
}
update()*/
//# sourceMappingURL=TempRep.js.map