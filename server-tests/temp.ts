import {Actor, Application, FarRef,SpiderActorMirror,SpiderObject,SpiderObjectMirror,SpiderIsolate} from "../src/spiders";
class Test extends Actor{

    init(){
        console.log("Actor init")
    }
    getMsg(){
        console.log("ok")
    }
}

class TA extends Application{

    init(){
        console.log("App init")
    }
    test(ref){
        ref.getMsg()
    }
}
let app = new TA()
let act = app.spawnActor(Test)
app.test(act)
