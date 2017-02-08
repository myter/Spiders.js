import {SpiderBenchmark, BenchConfig, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 07/02/2017.
 */
export class NodeFJThroughputBench extends SpiderBenchmark{
    actors
    lastPort = 8001
    mainSocket : ServerBufferSocket
    constructor(){
        super("Node Fork-join throughput","Node Fork-join cycle completed","Node Fork-join completed","Node Fork-join scheduled")
        this.actors = []
    }
    runBenchmark(){
        var actorsInitialised   = 0
        var actorsDone          = 0
        var that = this
        function sysHandler(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.fjThroughputActors){
                    actorsDone 	= 0
                    for(var i in that.actors){
                        that.actors[i].emit(["newMessage",true])
                    }
                    for(var i in that.actors){
                        var next = that.actors[i]
                        for(var j = 0;j < BenchConfig.fjThroughputMessages;j++){
                            next.emit(["newMessage",false])
                        }
                    }
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function actorDone(){
                actorsDone += 1
                if(actorsDone == BenchConfig.fjThroughputActors){
                    that.stopPromise.resolve()
                }
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "actorDone":
                    actorDone()
                    break;
            }
        }
        this.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandler)
        var count = BenchConfig.fjThroughputActors
        while(count > 0){
            var newActor = this.spawnNode("Fork-Join-Throughput/FJThroughputActor",sysHandler,this.lastPort)
            that.actors.push(newActor)
            newActor.emit(["config",BenchConfig.fjThroughputMessages])
            this.lastPort += 1
            count -= 1
        }
    }
    cleanUp(){
        this.cleanNodes()
        this.actors = []
        this.mainSocket.close()
    }
}