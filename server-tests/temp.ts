import {Actor, Application, FarRef,SpiderActorMirror,SpiderObject,SpiderObjectMirror} from "../src/spiders";
/*class App extends Application{
    constructor(){
        super()
        this.libs.setupPSServer()
    }
}
class Act extends Actor{
    init(){
        let psClient = this.libs.setupPSClient()
        let type     = new this.libs.PubSubTag("test")
        psClient.publish(5,type)
        psClient.subscribe(type).each((discov)=>{
            console.log("got: " + discov)
        })
    }
}
let app = new App()
app.spawnActor(Act)
app.spawnActor(Act)*/
class TestMirror extends SpiderObjectMirror{
    invoke(methodName,args){
        console.log("invoked: " + methodName)
    }
}
class Test extends SpiderObject{
    constructor(){
        super(new TestMirror())
    }

    foo(){

    }
}
let t = new Test()
t.foo()
let x = t instanceof Test
5
