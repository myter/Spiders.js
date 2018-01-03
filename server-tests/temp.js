Object.defineProperty(exports, "__esModule", { value: true });
const MAP_1 = require("../src/MAP");
var spiders = require("../src/spiders");
class TestAppliction extends spiders.Application {
    constructor() {
        super(...arguments);
        this.foo = 5;
    }
    pMethod(someVal) {
        console.log("Parent method invoked : " + this.foo + " arg: " + someVal);
        this.foo++;
    }
}
let app = new TestAppliction();
class TestActorMirror extends MAP_1.SpiderActorMirror {
    constructor() {
        super(...arguments);
        this.someVal = 5;
    }
    initialise(appActor, parentRef) {
        console.log("Meta call to initialise overriden !!!!! : ");
        super.initialise(appActor, parentRef);
    }
    someMethod() {
        return this.someVal + 10;
    }
}
class TestActor extends spiders.Actor {
    constructor() {
        super(new TestActorMirror());
        this.directory = __dirname;
    }
    init() {
        console.log("Base init called");
        console.log(this.reflectOnActor().someMethod());
        //TODO fix this bug
        //this.parent.pMethod(5)
    }
    send(toRef) {
        toRef.cMethod();
    }
    metaCall() {
        console.log("Meta call !!!");
    }
}
class TestActor2 extends spiders.Actor {
    cMethod() {
        console.log("Child method invoked");
    }
}
let a = app.spawnActor(TestActor);
let b = app.spawnActor(TestActor2);
a.send(b);
//# sourceMappingURL=temp.js.map