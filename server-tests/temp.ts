import {makeMethodAnnotation} from "../src/utils";
import {Application, SpiderIsolate, SpiderObject,SpiderObjectMirror,Actor,SpiderActorMirror} from "../src/spiders";


class TestIsol extends SpiderIsolate{

}

class TestMirror extends SpiderActorMirror{
    isol
    constructor(someIsol){
        super()
        this.isol = someIsol
    }
}

class TestActor extends Actor{
    constructor(){
        super(new TestMirror(new TestIsol()))
    }
}

let app = new Application()
app.spawnActor(TestActor)

