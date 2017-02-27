import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
import {SpiderLib} from "../../../src/spiders";
/**
 * Created by flo on 30/01/2017.
 */

var spiders : SpiderLib = require("../../../src/spiders")
class PingPongApp extends spiders.Application{
    pingInitialised = 	false
    pongInitialised = 	false
    pingRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    checkConfig(){
        if(this.pingInitialised && this.pongInitialised){
            this.pingRef.start()
        }
    }

    pingInit() {
        this.pingInitialised = true
        this.checkConfig()
    }

    pongInit(){
        this.pongInitialised = true
        this.checkConfig()
    }

    pingsExhausted(){
        this.bench.stopPromise.resolve()
    }
}
class PingActor extends spiders.Actor{
    totalPings  = null
    pingsLeft   = null
    pongRef     = null

    config(amPings,pongRef) {
        this.totalPings = amPings
        this.pingsLeft  = amPings
        this.pongRef    = pongRef
        this.parent.pingInit()
    }

    start(){
        this.pingsLeft 	= this.totalPings
        this.pongRef.ping()
        this.pingsLeft -= 1
    }

    pong(){
        if(this.pingsLeft == 0){
            this.parent.pingsExhausted()
        }
        else{
            this.pingsLeft -= 1
            this.pongRef.ping()
        }
    }
}
class PongActor extends spiders.Actor{
    pingRef = null

    config(pingRef){
        this.pingRef = pingRef
        this.parent.pongInit()
    }

    ping() {
        this.pingRef.pong()
    }
}

export class SpiderPinPongBench extends SpiderBenchmark{
    pingPongApp

    constructor(){
        super("Spiders.js Ping Pong","Spiders.js Ping Pong cycle completed","Spiders.js Ping Pong completed","Spiders.js Ping Pong scheduled")
    }

    runBenchmark(){
        this.pingPongApp    = new PingPongApp(this)
        var pongRef         = this.pingPongApp.spawnActor(PongActor)
        var pingRef         = this.pingPongApp.spawnActor(PingActor)
        this.pingPongApp.pingRef = pingRef
        pingRef.config(BenchConfig.pingAmount,pongRef)
        pongRef.config(pingRef)
    }

    cleanUp(){
        this.pingPongApp.kill()
    }
}