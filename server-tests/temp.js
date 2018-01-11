Object.defineProperty(exports, "__esModule", { value: true });
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
/*let app = new spiders.Application()

class LogMirror extends SpiderIsolateMirror{
    invoke(methodName : string,args : Array<any>){
        console.log("Invoking " + methodName)
        return super.invoke(methodName,args)
    }

    access(fieldName :string){
        console.log("Accessing "+ fieldName)
        return super.access(fieldName)
    }
}

class TestObject extends SpiderIsolate{
    constructor(LM){
        super(new LM())
    }
    baseField = "baseField"
    baseMethod(){
        return "baseMethodResult"
    }
}

class ActorA extends spiders.Actor{
    TestObject
    LogMirror
    bRef
    constructor(bRef){
        super()
        this.TestObject = TestObject
        this.LogMirror  = LogMirror
        this.bRef       = bRef
    }
    init(){
        let t = new this.TestObject(this.LogMirror)
        //let t = (this as any).instantiate(this.TestObject,this.LogMirror)
        this.bRef.getMirrorObject(t)
    }
}

class ActorB extends spiders.Actor{
    getMirrorObject(o){
        console.log(o.baseField)
        console.log(o.baseMethod())

    }
}
let b = app.spawnActor(ActorB)
app.spawnActor(ActorA,[b])*/
/*class LogMirror extends SpiderIsolateMirror{
    invoke(methodName : string,args : Array<any>){
        console.log("Invoking " + methodName)
        return super.invoke(methodName,args)
    }

    access(fieldName :string){
        console.log("Accessing "+ fieldName)
        return super.access(fieldName)
    }
}

class TestObject extends SpiderIsolate{
    constructor(LM){
        super(new LM())
    }
    baseField = "baseField"
    baseMethod(){
        return "baseMethodResult"
    }
}

class TestApp extends spiders.Application{
    send(toRef){
        toRef.getIsol(new TestObject(LogMirror))
        //toRef.getIsol((this as any).instantiate(TestObject,LogMirror))
    }
}
let app = new TestApp()

class TestActor extends spiders.Actor{
    getIsol(i){
        console.log(i.baseMethod())
        console.log(i.baseField)
    }
}

let a = app.spawnActor(TestActor)
app.send(a)*/
class TestActor extends spiders.Actor {
    getArray(arr) {
        console.log(arr.length);
        arr.forEach((el) => {
            console.log(el);
        });
    }
}
let app = new spiders.Application();
let act = app.spawnActor(TestActor);
act.getArray([1, 2, 3]);
//# sourceMappingURL=temp.js.map