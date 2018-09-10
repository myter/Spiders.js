
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
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                reject("trying to reject")
            },2000)
        })
    }
}
let act = app.spawnActor(TestActor)
console.log(act)