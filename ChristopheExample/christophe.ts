import {SpiderLib} from "../src/spiders";
import {MicroService} from "../src/MicroService/MicroService";
import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
import {PubSubTag} from "../src/PubSub/SubTag";

var spiders : SpiderLib = require("../src/spiders")
let monitor = new ServiceMonitor()
let aTag = new PubSubTag("A")
let bTag = new PubSubTag("B")

class Counter extends spiders.Signal{
    val

    constructor(){
        super()
        this.val = 0
    }

    @spiders.mutator
    inc(){
        this.val++
    }
}

class ServiceA extends MicroService{
    Counter
    counterSignal
    constructor(){
        super()
        this.Counter = Counter
    }
    start(){
        this.counterSignal = this.newSignal(this.Counter)
        this.publishSignal(this.counterSignal)
        this.updateCounter()
    }

    updateCounter(){
        setTimeout(()=>{
            this.counterSignal.inc()
            this.updateCounter()
        },2000)
    }
}

class ServiceB extends MicroService{
    start(importedSignals){
        this.lift(([counterSignal])=>{
            console.log(counterSignal.val)
        })(importedSignals)
    }
}
monitor.installRService(ServiceA,aTag,[],null)
monitor.installRService(ServiceB,bTag,[aTag],null)
monitor.deploy()