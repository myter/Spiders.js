
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
class TestServer extends Application{
    constructor(){
        super()
        this.libs.setupPSServer()
    }
}

let server = new TestServer()
class TestIsolate extends SpiderIsolate {
    val

    constructor(v) {
        super()
        this.val = v
    }
}
class TestClient extends Actor {
    testTag
    TestIsolate
    client

    constructor() {
        super()
        this.TestIsolate = TestIsolate
    }

    init(){
        this.client = this.libs.setupPSClient()
        this.testTag = new this.libs.PubSubTag("test")
    }

    pub() {
        this.client.publish(new this.TestIsolate(5), this.testTag)
    }

    sub() {
        let resolve
        let prom = new Promise((res) => {
            resolve = res
        })
        this.client.subscribe(this.testTag).each((isol) => {
            resolve(isol.val)
        })
        return prom
    }
}
let puber = server.spawnActor(TestClient)
let suber = server.spawnActor(TestClient)
puber.pub()
suber.sub().then((val) => {
    console.log(val)

})

