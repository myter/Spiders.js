import {Application, SpiderIsolate,Actor} from "../src/spiders";

class Test extends SpiderIsolate{
    val

    constructor(){
        super()
        this.val = 6
    }

    toString(){
        return "{val = " + this.val + "}"
    }
}


class TestActor extends Actor{
    getIsol(i){
        console.log("Inside Actor : " + i.toString())
    }
}
let app = new Application()
let act = app.spawnActor(TestActor)
let iso = new Test()
act.getIsol(iso)

