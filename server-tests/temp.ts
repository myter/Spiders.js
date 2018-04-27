import {makeMethodAnnotation} from "../src/utils";
import {Application, SpiderIsolate, SpiderObject,SpiderObjectMirror,Actor,SpiderActorMirror} from "../src/spiders";


class TestIsol extends SpiderIsolate{
    value

    constructor(){
        super()
        this.value = 5
    }
}

class TestMirror extends SpiderActorMirror{
    isol
    constructor(someIsol){
        super()
        this.isol = someIsol
    }
}

class TestActor extends Actor{
    TestIsol

    constructor(){
        super()
        this.TestIsol = TestIsol
    }

    init(){
        let t = new this.TestIsol()
        let tt = this.libs.clone(t)
    }
}

let app = new Application()
app.spawnActor(TestActor)

