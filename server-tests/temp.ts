
import {
    Application,
    SpiderIsolate,
    SpiderObject,
    SpiderObjectMirror,
    Actor,
    SpiderActorMirror,
    PubSubTag
} from "../src/spiders";
import {FarRef} from "../index";
var app = new Application()
class testActor1 extends Actor{
    getAndAccess(){
        return this.libs.remote("127.0.0.1",8082).then((ref) => {
            return ref.getVal()
        })
    }
}
class testActor2 extends Actor{
    getVal(){
        return 5
    }
}
app.spawnActor(testActor2,[],8082)
var actor  = app.spawnActor(testActor1)
actor.getAndAccess().then((v) => {
    console.log(v)
})

