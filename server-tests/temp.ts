
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


class TestApp extends Application{
    say(msg){
        console.log("App got: " + msg)
    }
}
let app = new TestApp()
class TestActor extends Actor{

    init(){
        console.log("ACTOR ID = " + this.libs.environment.thisRef.ownerId)
    }

    test(appRef : FarRef<TestApp>){
        //this.libs.offline()
        /*appRef.say("Hey from actor")
        setTimeout(()=>{
            console.log("Opening up again")
            this.libs.online()
        },3000)*/
    }
}
let act = app.spawnActor(TestActor)
act.test(app)
app.libs.offline()
setTimeout(()=>{
    console.log("GOING ONLINE")
    app.libs.online()
},3000)