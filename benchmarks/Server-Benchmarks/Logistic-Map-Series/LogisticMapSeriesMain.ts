import {ClientBufferSocket, SpiderBenchmark, BenchConfig, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
export class NodeLogisticMapSeriesBench extends SpiderBenchmark{
    static _MASTER_PORT_ = 8001
    lastPort = 8002
    masterRef : ClientBufferSocket
    computers : Map<number,ClientBufferSocket>
    workers : Array<ClientBufferSocket>
    mainSocket : ServerBufferSocket
    constructor(){
        super("Node Logistic Map Series","Node Logistic Map Series cycle completed","Node Logistic Map Series completed","Node Logistic Map Series scheduled")
        this.computers  = new Map()
        this.workers    = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == (BenchConfig.logMapSeries *  2) +  1){
                    that.masterRef.emit(["start"])
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
        that.masterRef = that.spawnNode("Logistic-Map-Series/LogisticMapSeriesMaster",sysHandle,NodeLogisticMapSeriesBench._MASTER_PORT_)
        var compCount 	= BenchConfig.logMapSeries - 1
        while(compCount >= 0){
            var newComp = that.spawnNode("Logistic-Map-Series/LogisticMapSeriesRate",sysHandle,that.lastPort)
            var rate = BenchConfig.logMapStartRate + (compCount * BenchConfig.logMapIncrement)
            newComp.emit(["config",rate])
            that.computers.set(that.lastPort,newComp)
            that.lastPort++
            compCount -= 1
        }
        var workCount 	= BenchConfig.logMapSeries - 1
        while(workCount >= 0){
            var newWork = that.spawnNode("Logistic-Map-Series/LogisticMapSeriesSeries",sysHandle,that.lastPort)
            that.masterRef.emit(["newWorker",BenchConfig.logMapSeries,BenchConfig.logMapTerms,that.lastPort])
            var index = 0
            var rater
            var raterPort
            that.computers.forEach((computer : ClientBufferSocket,computerPort : number)=>{
                if(index == workCount % that.computers.size){
                    rater = computer
                    raterPort = computerPort
                }
                index++
            })
            rater.emit(["link",that.lastPort])
            newWork.emit(["linkMaster",NodeLogisticMapSeriesBench._MASTER_PORT_])
            newWork.emit(["linkRate",raterPort])
            var startTerm 		= workCount * BenchConfig.logMapIncrement
            newWork.emit(["config",startTerm])
            that.workers.push(newWork)
            that.lastPort++
            workCount -= 1
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.workers    = []
        this.computers  = new Map()
    }
}