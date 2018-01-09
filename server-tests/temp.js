Object.defineProperty(exports, "__esModule", { value: true });
const MOP_1 = require("../src/MOP");
var spiders = require("../src/spiders");
/*class TestAppliction extends spiders.Application{
    foo = 5
    pMethod(someVal){
        console.log("Parent method invoked : " + this.foo + " arg: " + someVal)
        this.foo++
    }
}
let app = new TestAppliction()

class TestActorMirror extends SpiderActorMirror{
    someVal = 5
    initialise(appActor : boolean,parentRef : FarRef){
        console.log("Meta call to initialise overriden !!!!! : ")
        super.initialise(appActor,parentRef)
    }

    someMethod(){
        return this.someVal + 10
    }
}


class TestActor extends spiders.Actor{
    directory
    constructor(){
        super(new TestActorMirror())
        this.directory = __dirname
    }

    init(){
        console.log("Base init called")
        console.log((this.reflectOnActor() as TestActorMirror).someMethod())
        //TODO fix this bug
        //this.parent.pMethod(5)
    }

    send(toRef){
        toRef.cMethod()
    }

    metaCall(){
        console.log("Meta call !!!")
    }
}

class TestActor2 extends spiders.Actor{
    cMethod(){
        console.log("Child method invoked")
    }
}

let a = app.spawnActor(TestActor)
let b = app.spawnActor(TestActor2)
a.send(b)*/
let app = new spiders.Application();
class LogMirror extends MOP_1.SpiderObjectMirror {
    invoke(methodName, args) {
        console.log("Invoking " + methodName + " in " + this.base.environment.thisRef.ownerId);
        return super.invoke(methodName, args);
    }
    access(fieldName) {
        console.log("Accessing " + fieldName);
        return super.access(fieldName);
    }
}
class TestObject extends MOP_1.SpiderObject {
    constructor(LM) {
        super(new LM());
        this.baseField = "baseField";
    }
    baseMethod() {
        return "baseMethodResult";
    }
}
class ActorA extends spiders.Actor {
    constructor(bRef) {
        super();
        this.TestObject = TestObject;
        this.LogMirror = LogMirror;
        this.bRef = bRef;
    }
    init() {
        let t = this.instantiate(this.TestObject, this.LogMirror);
        this.bRef.getMirrorObject(t);
    }
}
class ActorB extends spiders.Actor {
    getMirrorObject(o) {
        o.baseMethod().then((v) => {
            console.log("Within b: " + v);
            o.baseMethod();
        });
    }
}
let b = app.spawnActor(ActorB);
app.spawnActor(ActorA, [b]);
//# sourceMappingURL=temp.js.map