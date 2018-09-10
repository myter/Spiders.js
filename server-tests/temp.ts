
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

    test(){
        var waitTill = new Date(new Date().getTime() + 50 * 1000);
        while(waitTill > new Date()){
            let n  = (waitTill.getTime() - new Date().getTime()) / 1000
            if(!((n - Math.floor(n)) !== 0)){
                console.log("Seconds left: " + n)
            }
        }
        console.log("test finished")
    }
}
let act = app.spawnActor(TestActor)
act.test().then((res)=>{
    console.log("Promise resolved")
})