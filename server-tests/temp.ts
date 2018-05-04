import {makeMethodAnnotation} from "../src/utils";
import {
    Application,
    SpiderIsolate,
    SpiderObject,
    SpiderObjectMirror,
    Actor,
    SpiderActorMirror,
    PubSubTag
} from "../src/spiders";


class App extends Application{
    constructor(){
        super(new SpiderActorMirror,"127.0.0.1",8000)
        this.libs.setupPSServer()
    }
}

class Act extends Actor{
    ownType
    othertypes
    constructor(type,othertypes){
        super()
        this.ownType    = type
        this.othertypes = othertypes
    }

    init(){
        let psClient = this.libs.setupPSClient("127.0.0.1",8000)
        let discovered = 0
        this.othertypes.forEach((type)=>{
            psClient.subscribe(type).once(()=>{
                discovered++
                console.log(this.ownType.tagVal + " discovered : " + discovered)
            })
        })
        psClient.publish("ok",this.ownType)
    }
}

let t1 = new PubSubTag("t1")
let t2 = new PubSubTag("t2")
let t3 = new PubSubTag("t3")
let t4 = new PubSubTag("t4")
let t5 = new PubSubTag("t5")
let app = new App()
app.spawnActor(Act,[t1,[t2,t3,t4,t5]])
app.spawnActor(Act,[t2,[t1,t3,t4,t5]])
app.spawnActor(Act,[t3,[t1,t2,t4,t5]])
app.spawnActor(Act,[t4,[t1,t2,t3,t5]])
app.spawnActor(Act,[t5, [t1,t2,t3,t4]])
