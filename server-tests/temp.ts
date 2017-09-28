import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require("../src/spiders")

class TestSignal extends spiders.Signal{
    val

    @spiders.mutator
    set(v){
        console.log("Setting")
        this.val = v
    }
}

class TestIsolate extends spiders.Isolate{

}

class TestActor extends spiders.Actor{
    defS
    defI

    constructor(){
        super()
        this.defS = TestSignal
        this.defI = TestIsolate
    }

    init(){
        let sig : any = this.newSignal(this.defS)
        this.lift((v)=>{
            console.log("New value : " + v.val)
        })(sig)
        sig.set(5)
    }
}

let app = new spiders.Application()
app.spawnActor(TestActor)

