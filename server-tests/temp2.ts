import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
import {SpiderLib} from "../src/spiders";
import {MicroService} from "../src/MicroService/MicroService";
import {PubSubTag} from "../src/PubSub/SubTag";
var spiders : SpiderLib = require("../src/spiders")
let monitor = new ServiceMonitor()
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

var SourceTag   = new PubSubTag("Source")
var ATag        = new PubSubTag("A")
var BTag        = new PubSubTag("B")
var SinkTag     = new PubSubTag("Sink")

class Source extends MicroService{
    TestSignal
    t

    constructor(){
        super()
        this.TestSignal = TestSignal
    }

    start(subSignal){
        this.t = this.newSignal(this.TestSignal)
        this.publishSignal(this.t)
        this.update()
    }

    update(){
        setTimeout(()=>{
            this.t.inc()
            this.update()
        },2000)
    }
}

class A extends MicroService{
    start(subSignal){
        let r = this.lift(([v])=>{
            return ++v.value
        })(subSignal)
        this.publishSignal(r)
    }
}

class B extends MicroService{
    start(subSignal){
        let r = this.lift(([v])=>{
            return ++v.value
        })(subSignal)
        this.publishSignal(r)
    }
}

class Sink extends MicroService{
    start(subSignal){
        this.lift(([v1,v2])=>{
            console.log("Got: " + v1 + " , " + v2)
        })(subSignal)
    }
}

monitor.installRService(Sink,SinkTag,[ATag,BTag],null)
monitor.installRService(Source,SourceTag,[],null)
monitor.installRService(A,ATag,[SourceTag],null)
monitor.installRService(B,BTag,[SourceTag],null)
monitor.deploy()