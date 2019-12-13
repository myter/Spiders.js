import {Application, SpiderIsolate, Actor, SpiderObject, SpiderObjectMirror} from "../src/spiders";

class TestIsolate extends SpiderIsolate{
    testMirror(){
        console.log(this.mirror)
    }
}

let t = new TestIsolate()
t.testMirror()

