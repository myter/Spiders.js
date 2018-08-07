
import {
    Application,
    SpiderIsolate,
    SpiderObject,
    SpiderObjectMirror,
    Actor,
    SpiderActorMirror,
    PubSubTag
} from "../src/spiders";


var app = new Application()
class PrintActor extends Actor{
    someField
    TestIsolate
    constructor(){
        super()
        this.someField = "foo"
        this.TestIsolate = TestIsolate
    }

    test(isol){
        let x = new this.TestIsolate()
        console.log(isol.toString())
    }
}

class TestIsolate extends SpiderIsolate{
    hello(){
        return "isolate"
    }

    toString(){
        return "TESTISOLATE TO STRING METHOD"
    }
}

let act = app.spawnActor(PrintActor)
let iso = new TestIsolate()
act.test(new TestIsolate())