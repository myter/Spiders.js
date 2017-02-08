import {ClientBufferSocket, SpiderBenchmark, BenchConfig, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
export class NodeCigaretteSmokersBench extends SpiderBenchmark{
    static _ARBITER_PORT_ = 8001
    lastPort = 8002
    arbiterRef : ClientBufferSocket
    smokers : Array<ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Cigarette Smokers","Node Cigarette Smokers cycle completed","Node Cigarette Smokers completed","Node Cigarette Smokers scheduled")
        this.smokers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.cigSmokeSmokers +  1){
                    that.arbiterRef.emit(["pickRandom"])
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
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        that.arbiterRef = that.spawnNode("Cigarette-Smokers/CigaretteSmokersArbiter",sysHandle,NodeCigaretteSmokersBench._ARBITER_PORT_)
        that.arbiterRef.emit(["config",BenchConfig.cigSmokeRounds,BenchConfig.cigSmokeSmokers])
        var smokCount 	= BenchConfig.cigSmokeSmokers - 1
        while(smokCount >= 0){
            var newSmok = that.spawnNode("Cigarette-Smokers/CigaretteSmokersSmoker",sysHandle,that.lastPort)
            newSmok.emit(["config",NodeCigaretteSmokersBench._ARBITER_PORT_])
            that.arbiterRef.emit(["newSmoker",that.lastPort])
            that.smokers.push(newSmok)
            that.lastPort++
            smokCount -= 1
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.smokers = []
    }
}