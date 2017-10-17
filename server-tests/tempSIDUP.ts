import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
import {MicroService} from "../src/MicroService/MicroService";
import {PubSubTag} from "../src/PubSub/SubTag";
import {SpiderLib} from "../src/spiders";



var spiders : SpiderLib = require("../src/spiders")
let admitterTag = new PubSubTag("admitter")
let sourceTag   = new PubSubTag("source")
let source2Tag  = new PubSubTag("source2")
let sinkTag     = new PubSubTag("sink")
let aTag        = new PubSubTag("a")
let bTag        = new PubSubTag("b")
let dynTag      = new PubSubTag("dynamic")

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

class Test2Signal extends spiders.Signal{
    bool
    constructor(){
        super()
        this.bool = false
    }

    @spiders.mutator
    change(){
        this.bool = !this.bool
    }
}

let monitor     = new ServiceMonitor()

class Admitter extends MicroService{
    admitterTag

    constructor(){
        super()
        this.admitterTag = admitterTag
    }
    init(){
        this.SIDUPAdmitter(this.admitterTag,1)
    }
}

class SourceService extends MicroService{
    sourceTag
    sinkTag
    aTag
    bTag
    admitter
    TestSignal

    constructor(){
        super()
        this.sourceTag  = sourceTag
        this.aTag       = aTag
        this.bTag       = bTag
        this.TestSignal = TestSignal
        this.sinkTag    = sinkTag
        this.admitter   = admitterTag
    }

    init(){
        this.SIDUP(this.sourceTag,[],this.admitter)
        let t : any = this.newSignal(this.TestSignal)
        this.publishSignal(t)
        this.update(t)
    }

    update(t){
        setTimeout(()=>{
            t.inc()
            this.update(t)
        },2000)
    }
}

class Source2Service extends  MicroService{
    sourceTag
    sinkTag
    aTag
    bTag
    admitter
    TestSignal

    constructor(){
        super()
        this.sourceTag  = source2Tag
        this.aTag       = aTag
        this.bTag       = bTag
        this.TestSignal = Test2Signal
        this.sinkTag    = sinkTag
        this.admitter   = admitterTag
    }

    init(){
        this.SIDUP(this.sourceTag,[],this.admitter)
        let t : any = this.newSignal(this.TestSignal)
        this.publishSignal(t)
        this.update(t)
    }

    update(t){
        setTimeout(()=>{
            t.change()
            this.update(t)
        },3000)
    }
}

class ServiceA extends MicroService{
    sourceTag
    source2Tag
    sinkTag
    aTag
    admitter

    constructor(){
        super()
        this.sourceTag  = sourceTag
        this.source2Tag = source2Tag
        this.sinkTag    = sinkTag
        this.aTag       = aTag
        this.admitter   = admitterTag
    }

    init(){
        let s = this.SIDUP(this.aTag,[this.sourceTag,this.source2Tag],this.admitter)
        let ss = this.lift((sa)=>{
            if(sa[1]){
                console.log("Got change in A: " + sa[0].value + " : " + sa[1].bool)
            }
            else{
                console.log("Got change in A: " + sa[0].value)
            }
            return sa[0].value + 1
        })(s)
        this.publishSignal(ss)
    }
}

class ServiceB extends MicroService{
    sourceTag
    sinkTag
    bTag
    admitter

    constructor(){
        super()
        this.sourceTag  = sourceTag
        this.sinkTag    = sinkTag
        this.bTag       = bTag
        this.admitter   = admitterTag
    }

    init(){
        let s = this.SIDUP(this.bTag,[this.sourceTag],this.admitter)
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
    admitter

    constructor(){
        super()
        this.aTag       = aTag
        this.bTag       = bTag
        this.sinkTag    = sinkTag
        this.admitter   = admitterTag
    }

    init(){
        let s = this.SIDUP(this.sinkTag,[this.aTag,this.bTag],this.admitter,true)
        this.lift((vals : Array<number>)=>{
            console.log("Got change in sink: " + vals)
        })(s)
    }
}
let adm     = monitor.spawnActor(Admitter)
let source  = monitor.spawnActor(SourceService)
let source2 = monitor.spawnActor(Source2Service)
let sink    = monitor.spawnActor(SinkService)
let a       = monitor.spawnActor(ServiceA)
let b       = monitor.spawnActor(ServiceB)

/*class DynamicService extends MicroService{
    sinkTag
    sourceTag
    dynTag

    constructor(){
        super()
        this.sinkTag = sinkTag
        this.sourceTag = sourceTag
        this.dynTag = dynTag
    }

    init(){
        let s = this.QPROP(this.dynTag,[this.sourceTag],[this.sinkTag],null)
        let ss = this.lift((sa)=>{
            console.log("Got change in dynamic: "+ sa[0].value)
            return (sa[0].value + 1)
        })(s)
        this.publishSignal(ss)
    }

}*/