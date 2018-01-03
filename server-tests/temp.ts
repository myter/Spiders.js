import {FarRef, SpiderLib} from "../src/spiders";
import {SpiderActorMirror} from "../src/MAP";
import {SpiderObject, SpiderObjectMirror} from "../src/MOP";

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

class TestObject extends SpiderObject{
    baseField = "baseField"
    baseMethod(){
        return "baseMethodResult"
    }
}

class ActorA extends spiders.Actor{
    TestObject
    constructor(){
        super()
        this.TestObject = TestObject
    }
    init(){
        let t = new this.TestObject()
        console.log(t.baseField)
        console.log(t.baseMethod())
    }
}

class ActorB extends spiders.Actor{

}

app.spawnActor(ActorA)