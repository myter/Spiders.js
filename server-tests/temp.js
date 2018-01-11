Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TestMirror extends spiders.SpiderObjectMirror {
    invoke(methodName, args) {
        console.log("Invoke captured");
        this.testValue = 5;
        return super.invoke(methodName, args);
    }
}
class TestObject extends spiders.SpiderObject {
    constructor(mirrorClass) {
        super(new mirrorClass());
    }
    someMethod() {
        console.log("Some method called");
        return 5;
    }
}
class TestActor extends spiders.Actor {
    constructor() {
        super();
        this.TestObject = TestObject;
        this.TestMirror = TestMirror;
    }
    test() {
        let o = new this.TestObject(this.TestMirror);
        let r = o.someMethod();
        console.log("mirror val:" + this.reflectOnObject(o).testValue);
        console.log("Result: " + r);
        return this.reflectOnObject(o).testValue + r;
    }
}
let app = new spiders.Application();
let act = app.spawnActor(TestActor);
act.test().then((v) => {
    console.log("Got result: " + v);
});
//# sourceMappingURL=temp.js.map