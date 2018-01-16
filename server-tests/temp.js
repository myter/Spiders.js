Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TestIsolate extends spiders.SpiderIsolate {
    constructor() {
        super();
        this.field = 5;
    }
}
class TestBaseIsolate extends TestIsolate {
    constructor() {
        super();
        this.baseField = 6;
    }
}
class TestActor extends spiders.Actor {
    constructor() {
        super();
        this.TestIsolate = TestBaseIsolate;
    }
    init() {
        let isol = new this.TestIsolate();
        console.log(isol.baseField);
        console.log(isol.field);
    }
    getIsolate() {
        return new this.TestIsolate();
        //return this.TestIsolate
    }
}
let app = new spiders.Application();
let act = app.spawnActor(TestActor);
act.getIsolate().then((isol) => {
    console.log("Got isol");
    console.log(isol.baseField);
    console.log(isol.field);
});
/*act.getIsolate().then((isol)=>{
    console.log("Got isol")
    /*console.log("Got isol")
    console.log(isol.field)
    console.log(isol.baseField)
})*/ 
//# sourceMappingURL=temp.js.map