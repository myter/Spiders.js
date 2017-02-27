import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 24/01/2017.
 */


export class NatPingPongBench extends SpiderBenchmark{
    pingWorker
    pongWorker

    constructor(){
        super("Native Ping Pong","Native Ping Pong cycle completed","Native Ping Pong completed","Native Ping Pong Scheduled")
    }

    runBenchmark(){
        var pingInitialised = false
        var pongInitialised = false
        var that = this
        function messageHandler(event) {
            function checkConfig() {
                if (pingInitialised && pongInitialised) {
                    that.pingWorker.postMessage(["start"])
                }
            }

            function pingInit() {
                pingInitialised = true
                checkConfig()
            }

            function pongInit() {
                pongInitialised = true
                checkConfig()
            }

            function pingsExhausted() {
                that.stopPromise.resolve()
            }

            switch (event.data[0]) {
                case "checkConfig" :
                    checkConfig()
                    break;
                case "pingInit" :
                    pingInit()
                    break;
                case "pongInit" :
                    pongInit()
                    break;
                case "pingsExhausted" :
                    pingsExhausted()
                    break;
            }
        }
        this.pingWorker      = this.spawnWorker(require('./PingActor'))
        this.pingWorker.addEventListener('message',messageHandler)
        this.pongWorker      = this.spawnWorker(require('./PongActor'))
        this.pongWorker.addEventListener('message',messageHandler)
        var chan            = new MessageChannel()
        this.pingWorker.postMessage(["config",BenchConfig.pingAmount],[chan.port1])
        this.pongWorker.postMessage(["config"],[chan.port2])
    }

    cleanUp(){
        this.cleanWorkers([this.pingWorker,this.pongWorker])
    }
}