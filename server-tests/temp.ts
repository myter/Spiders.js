import {Actor, Application, FarRef,SpiderActorMirror,SpiderObject,SpiderObjectMirror} from "../src/spiders";
var app = new Application()
class testActor1 extends Actor{
    getAndAccess(){
        return new Promise((resolve)=>{
            let rem = this.libs.buffRemote("127.0.0.1",8082)
            let ps  = []
            ps[0]   = rem.getVal()
            ps[1]   = rem.someVal
            setTimeout(()=>{
                ps[2] = rem.getVal()
                ps[3] = rem.someVal
                resolve(Promise.all(ps))
            },2000)
        })
    }
}
class testActor2 extends Actor{
    someVal
    constructor(){
        super()
        this.someVal = 6
    }
    getVal(){
        return 5
    }
}
var actor  = app.spawnActor(testActor1)
actor.getAndAccess().then((v) => {
    console.log("Got : " + v)
})
app.spawnActor(testActor2,[],8082)
