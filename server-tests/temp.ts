import {SpiderLib} from "../src/spiders";
import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
import {MicroService} from "../src/MicroService/MicroService";
import {PubSubTag} from "../src/PubSub/SubTag";

var spiders : SpiderLib = require("../src/spiders")
let monitor     = new ServiceMonitor()
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
        this.bool = true
    }

    @spiders.mutator
    change(){
        this.bool = !this.bool
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
        let t : any = this.newSignal(this.TestSignal)
        this.QPROP(this.sourceTag,[],[this.aTag,this.bTag],t)
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

class Source2Service extends MicroService{
    source2Tag
    bTag
    aTag
    TestSignal

    constructor(){
        super()
        this.source2Tag = source2Tag
        this.TestSignal = Test2Signal
        this.bTag       = bTag
        this.aTag       = aTag
    }

    init(){
        let t : any = this.newSignal(this.TestSignal)
        this.QPROP(this.source2Tag,[],[this.bTag],t)
        this.publishSignal(t)
        this.update(t)
        setTimeout(()=>{
            console.log("Adding dependency")
            this.addDependency(this.source2Tag,this.aTag)
        },7000)
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
    sinkTag
    aTag

    constructor(){
        super()
        this.sourceTag  = sourceTag
        this.sinkTag    = sinkTag
        this.aTag       = aTag
    }

    init(){
        let s = this.QPROP(this.aTag,[this.sourceTag],[this.sinkTag],-1)
        let ss = this.lift(([s1,s2])=>{
            if(s2){
                console.log("Got change in A: " + s1.value + " : " + s2.bool)
            }
            else{
                console.log("Got change in A: " + s1.value)
            }
            return (s1.value + 1)
        })(s)
        this.publishSignal(ss)
    }
}

class ServiceB extends MicroService{
    sourceTag
    source2Tag
    sinkTag
    bTag

    constructor(){
        super()
        this.sourceTag  = sourceTag
        this.source2Tag = source2Tag
        this.sinkTag    = sinkTag
        this.bTag       = bTag
    }

    init(){
        let s = this.QPROP(this.bTag,[this.sourceTag,this.source2Tag],[this.sinkTag],-1);
        let ss = this.lift(([s1,s2])=>{
            if(s2){
                console.log("Got change in B: " + s1.value + " : " + s2.bool)
            }
            else{
                console.log("Got change in B: " + s1.value)
            }
            return (s1.value + 1)
        })(s)
        this.publishSignal(ss)
    }
}

class DynamicService extends MicroService{
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
        this.lift((vals : Array<number>)=>{
            /*console.log("Got change in sink: " + vals.reduce((prev,curr)=>{
                return prev + curr
            }))*/
            console.log("Got change in sink: " + vals)
        })(s)
    }
}
let source  = monitor.spawnActor(SourceService)
let source2 = monitor.spawnActor(Source2Service)
let sink    = monitor.spawnActor(SinkService)
let a       = monitor.spawnActor(ServiceA)
let b       = monitor.spawnActor(ServiceB)

/*setTimeout(()=>{
    monitor.spawnActor(DynamicService)
},3500)*/