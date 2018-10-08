
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
class TestActor extends Actor{

    test(ref){
        ref.apply()
    }
}
let act = app.spawnActor(TestActor)
act.test(()=>{console.log("Worked!!!!")}).then((res)=>{
    console.log("Promise resolved")
})