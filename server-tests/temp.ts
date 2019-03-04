import {Application, SpiderIsolate, Actor, SpiderObject, SpiderObjectMirror} from "../src/spiders";

class TestMirror extends SpiderObjectMirror{

}

class TestObject extends SpiderObject{
    constructor(){
        super(new TestMirror())
    }
}

