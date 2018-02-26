import {Actor, Application, FarRef,SpiderActorMirror,SpiderObject,SpiderObjectMirror,SpiderIsolate} from "../src/spiders";
class TestActor extends Actor{
    getBuff(b){
        console.log("got:")
        console.log(b)
    }

    sendBuff(){
        return new Buffer("Wut")
    }
}

let app = new Application()
let act = app.spawnActor(TestActor)
let b = new Buffer("Wut")
act.sendBuff().then((bb)=>{
    console.log(b.equals(bb))
    console.log(bb.equals(b))
})
