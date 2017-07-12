import {MicroService} from "../src/MicroService/MicroService";
import {SpiderLib} from "../src/spiders";
/**
 * Created by flo on 02/07/2017.
 */
var spiders : SpiderLib = require("../src/spiders")

@spiders.lease(5000)
@spiders.weak
class CounterSignal extends spiders.Signal{
    c

    constructor(initVal){
        super()
        this.c = initVal
    }

    @spiders.mutator
    inc(){
        this.c++
    }

    @spiders.mutator
    dec(){
        this.c--
    }
}

@spiders.lease(5000)
@spiders.weak
class LogSignal extends spiders.Signal{
    log

    constructor(initLog){
        super()
        this.log = initLog
    }

    @spiders.mutator
    append(text){
        this.log = this.log + text
    }
}

class DeriveIsolate extends spiders.Isolate{
    wut
    constructor(v){
        super()
        this.wut = v
    }
}
export class FastPubTestService extends MicroService{
    published
    derived

    init(){
        this.published      = this.newSignal(CounterSignal,1)
        /*this.derived        = this.lift((counter)=>{
            let isol = new DeriveIsolate(counter.c * 10)
            return isol
        })(this.published)*/
        this.publish(this.published,this.newTopic("TestTopic"))
        this.pulse(5)
    }

    pulse(times){
        if(times > 0){
            setTimeout(()=>{
                this.published.inc()
                this.pulse(times - 1)
            },2000)
        }

    }
}

export class SlowPubTestService extends MicroService{
    published

    init(){
        this.published = this.newSignal(LogSignal,"initial:")
        this.publish(this.published,this.newTopic("LogTopic"))
        this.pulse(5)
    }

    pulse(times){
        if(times > 0){
            setTimeout(()=>{
                this.published.append(times.toString() + ":")
                this.pulse(times - 1)
            },3000)
        }

    }
}

export class SubTestService extends MicroService{
    counterSig
    logSig

    init(){
        let res
        let p = new Promise((resolve)=>{
           res = resolve
        })
        this.subscribe(this.newTopic("TestTopic")).once((sig)=>{
            this.counterSig = sig
            if(this.logSig != null){
                res()
            }
        })
        this.subscribe(this.newTopic("LogTopic")).once((sig)=>{
            this.logSig = sig
            if(this.counterSig != null){
                res()
            }
        })
        p.then(()=>{
            let f = this.lift((counter,log)=>{
                console.log("Counter value: " +  counter.c + " log : " + log.log)
            })
            f(this.counterSig,this.logSig)
            let failure = this.liftFailure((_,__)=>{
                console.log("Counter and log being garbage collected")
            })(this.counterSig,this.logSig)
            this.liftFailure((_)=>{
                console.log("Garbage propagation seems to work")
            })(failure)
        })
    }

}