import {makeMethodAnnotation} from "../src/utils";
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
    constructor(){
        super()
        this.someField = "foo"
    }

    someMethod(){

    }
}

let t = app.spawnActor(PrintActor)
console.log(t)