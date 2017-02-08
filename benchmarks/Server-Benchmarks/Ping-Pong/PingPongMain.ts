import {SpiderBenchmark, BenchConfig, ServerBufferSocket, ClientBufferSocket} from "../../benchUtils";
import {Socket} from "net";
/**
 * Created by flo on 07/02/2017.
 */
export class NodePingPongBench extends SpiderBenchmark{
    mainSocket : ServerBufferSocket
    pingSocket : ClientBufferSocket
    static _PING_PORT_ = 8001
    static _PONG_PORT_ = 8002

    constructor(){
        super("Node Ping Pong","Node Ping Pong cycle completed","Node Ping Pong completed","Node Ping Pong Scheduled")
    }

    runBenchmark(){
        var pingInitialised = false
        var pongInitialised = false
        var that = this
        function messageHandler(data) {
            function checkConfig() {
                if (pingInitialised && pongInitialised) {
                    that.pingSocket.emit(["start"])
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
            switch (data[0]) {
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
        this.mainSocket             = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,messageHandler)
        this.pingSocket             = this.spawnNode('Ping-Pong/PingActor',messageHandler,NodePingPongBench._PING_PORT_)
        var pongSocket              = this.spawnNode('Ping-Pong/PongActor',messageHandler,NodePingPongBench._PONG_PORT_)
        this.pingSocket.emit(["config",BenchConfig.pingAmount])
        pongSocket.emit(["config"])
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
    }
}