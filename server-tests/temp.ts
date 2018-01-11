import {SpiderLib} from "../src/spiders";
import {SpiderIsolate, SpiderIsolateMirror} from "../src/MOP";

var spiders : SpiderLib = require("../src/spiders")

class TestApp extends spiders.Application{
    someMethod(){
        console.log("Method invoked")
    }
}
class TestActor extends spiders.Actor{
    init(){
        this.parent.someMethod()
    }
    invokeParent(){
        this.parent.someMethod()
    }
}
let app = new TestApp()
let act = app.spawnActor(TestActor)
//act.invokeParent()
