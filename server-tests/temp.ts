import {SpiderLib} from "../src/spiders";
import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
import {MicroService} from "../src/MicroService/MicroService";
import {PubSubTag} from "../src/PubSub/SubTag";

var spiders : SpiderLib = require("../src/spiders")
let monitor     = new ServiceMonitor()
let sourceTag   = new PubSubTag("source")
let sinkTag     = new PubSubTag("sink")
let aTag        = new PubSubTag("a")
let bTag        = new PubSubTag("b")

class TestSignal extends spiders.Signal{
    value

    constructor(){
        super()
        this.value = 1
    }

    @spiders.mutator
    inc(){
        ++this.value
    }
}

class SourceService extends MicroService{
    sourceTag
    sinkTag
    aTag
    bTag
    TestSignal

    constructor(){
        super()
        this.sourceTag  = sourceTag
        this.aTag       = aTag
        this.bTag       = bTag
        this.TestSignal = TestSignal
        this.sinkTag    = sinkTag
    }

    init(){
        this.QPROP(this.sourceTag,[],[this.aTag,this.bTag],null)
        let t : any = this.newSignal(this.TestSignal)
        this.publishSignal(t)
        setTimeout(()=>{
            t.inc()
        },3000)
    }
}

class ServiceA extends MicroService{
    sourceTag
    sinkTag
    aTag

    constructor(){
        super()
        this.sourceTag  = sourceTag
        this.sinkTag    = sinkTag
        this.aTag       = aTag
    }

    init(){
        let s = this.QPROP(this.aTag,[this.sourceTag],[this.sinkTag],null)
        let ss = this.lift((sa)=>{
            console.log("Got change in A: " + sa[0].value)
            return sa[0].value + 1
        })(s)
        this.publishSignal(ss)
    }
}

class ServiceB extends MicroService{
    sourceTag
    sinkTag
    bTag

    constructor(){
        super()
        this.sourceTag  = sourceTag
        this.sinkTag    = sinkTag
        this.bTag       = bTag
    }

    init(){
        let s = this.QPROP(this.bTag,[this.sourceTag],[this.sinkTag],null)
        let ss = this.lift((sa)=>{
            console.log("Got change in B: " + sa[0].value)
            return (sa[0].value + 1)
        })(s)
        this.publishSignal(ss)
    }
}

class SinkService extends MicroService{
    aTag
    bTag
    sinkTag

    constructor(){
        super()
        this.aTag       = aTag
        this.bTag       = bTag
        this.sinkTag    = sinkTag
    }

    init(){
        let s = this.QPROP(this.sinkTag,[this.aTag,this.bTag],[],null)
        this.lift((sab)=>{
            for(var i in sab[0]){
                console.log(i)
            }
            console.log("Got change in sink: " + (sab[0] + sab[1]))
        })(s)
    }
}
let source  = monitor.spawnActor(SourceService)
let sink    = monitor.spawnActor(SinkService)
let a       = monitor.spawnActor(ServiceA)
let b       = monitor.spawnActor(ServiceB)