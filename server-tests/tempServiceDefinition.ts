import {MicroService} from "../src/MicroService/MicroService";
import {SpiderLib} from "../src/spiders";
import {mutator} from "../src/Reactivivity/signal";
/**
 * Created by flo on 02/07/2017.
 */
var spiders : SpiderLib = require("../src/spiders")

class CounterSignal extends spiders.Signal{
    c

    //TODO specify boundaries
    constructor(initVal){
        super()
        this.c = initVal
    }

    @mutator
    inc(){
        this.c++
    }

    @mutator
    dec(){
        this.c--
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
        this.derived        = this.lift((counter)=>{
            let isol = new DeriveIsolate(counter.c * 10)
            return isol
        })(this.published)
        //this.leaseSignal(this.published,5000,Infinity)
        this.publish(this.published,this.newTopic("TestTopic"))
        this.pulse(10)
    }

    pulse(times){
        if(times > 0){
            setTimeout(()=>{
                if(times % 2 == 0){
                    this.published.inc()
                }
                else{
                    this.published.dec()
                }
                this.pulse(times - 1)
            },4000)
        }

    }
}

export class SubTestService extends MicroService{
    init(){

        this.subscribe(this.newTopic("TestTopic")).each((sig)=>{
            console.log("Got sub val ")
            let f = this.lift((v)=>{
                console.log("New val (FUCK YEAH) = " + v.c)
            })
            f(sig)
        })
    }

}