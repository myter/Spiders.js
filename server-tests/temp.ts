import {Actor, Application, FarRef,SpiderActorMirror,SpiderObject,SpiderObjectMirror,SpiderIsolate} from "../src/spiders";

class Isol extends SpiderIsolate{
    val
    constructor(){
        super()
        this.val = 5
    }

    within(){
        console.log(this["_SPIDER_OBJECT_MIRROR_"])
    }
}

class Act extends Actor{
    Isol

    constructor(){
        super()
        this.Isol = Isol
    }

    test(){
        let i = new this.Isol()
        /*setTimeout(()=>{
            i.within()
        },2000)*/
        return i
    }
}
let app = new Application()
let act = app.spawnActor(Act)
act.test().then((i)=>{
    console.log("got isol back")
    console.log(i.val)
    i.within()
    act.test().then((ii)=>{
        console.log("Got isol second time")
        console.log(ii.val)
        i.within()
    })
})