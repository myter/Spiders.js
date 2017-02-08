import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
export class NodeBigBench extends SpiderBenchmark{
    actors : Map<number,ClientBufferSocket>
    sinkRef : ClientBufferSocket
    mainPort : ServerBufferSocket
    static _SINK_PORT_  = 8001
    lastPort            = 8002

    constructor(){
        super("Node Big","Node Big cycle completed","Node Big completed","Node Big scheduled")
        this.actors = new Map()
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this
        function sysHandler(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.bigActors + 1){
                    that.actors.forEach((actorSocket : ClientBufferSocket)=>{
                        actorSocket.emit(["pong"])
                    })
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "end":
                    end()
                    break;
                default :
                    console.log("Unknown message: " + data[0])
            }
        }
        that.mainPort = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandler)
        that.sinkRef = this.spawnNode("Big/BigSink",sysHandler,NodeBigBench._SINK_PORT_)
        var count = BenchConfig.bigActors
        while(count > 0){
            var newActor = this.spawnNode("Big/BigActor",sysHandler,that.lastPort)
            that.actors.set(that.lastPort,newActor)
            that.lastPort++
            count -= 1
        }
        that.actors.forEach((current : ClientBufferSocket,currentPort : number)=>{
            current.emit(["setSink"])
            that.sinkRef.emit(["neighbour",BenchConfig.bigActors,currentPort])
            that.actors.forEach((next : ClientBufferSocket,nextPort : number)=>{
                if(nextPort != currentPort){
                    current.emit(["neighbour",BenchConfig.bigActors,BenchConfig.bigPings,nextPort])
                    next.emit(["link",currentPort])
                }
            })
        })
    }

    cleanUp(){
        this.cleanNodes()
        this.mainPort.close()
        this.actors = new Map()
    }
}