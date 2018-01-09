import {FarRef, SpiderLib} from "../src/spiders";
import {SpiderActorMirror} from "../src/MAP";
import {SpiderIsolate, SpiderObject, SpiderObjectMirror} from "../src/MOP";

var spiders : SpiderLib = require("../src/spiders")

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

let app = new spiders.Application()

class LogMirror extends SpiderObjectMirror{
    invoke(methodName : string,args : Array<any>){
        console.log("Invoking " + methodName + " in " + this.base.environment.thisRef.ownerId)
        return super.invoke(methodName,args)
    }

    access(fieldName :string){
        console.log("Accessing "+ fieldName)
        return super.access(fieldName)
    }
}

class TestObject extends SpiderObject{
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
        let t = (this as any).instantiate(this.TestObject,this.LogMirror)
        this.bRef.getMirrorObject(t)
    }
}

class ActorB extends spiders.Actor{
    getMirrorObject(o){
        o.baseMethod().then((v)=>{
            console.log("Within b: " + v )
            o.baseMethod()
        })
    }
}
let b = app.spawnActor(ActorB)
app.spawnActor(ActorA,[b])