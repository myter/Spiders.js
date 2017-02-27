import {SpiderBenchmark, BenchConfig, ServerBufferSocket} from "../benchUtils";
/**
 * Created by flo on 20/02/2017.
 */
export class ChildProcessMonteCarloBench extends SpiderBenchmark{
    mainSocket
    lastPort = 8001

    constructor(){
        super("Child Process Monte Carlo","Child Process Monte Carlo cycle completed","Child Process Monte Carlo completed","Child Process Monte Carlo scheduled")
    }

    runBenchmark(){
        var resultsReceived = 0
        var that            = this
        //The only even received is the "result" event
        function messageHandler(event){
            resultsReceived += 1
            if(resultsReceived == BenchConfig.monteCarloWorkers){
                that.stopPromise.resolve()
            }
        }
        this.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,messageHandler)
        for(var i = 0;i < BenchConfig.monteCarloWorkers;i++){
            let act = this.spawnNode('./ChildProcessCarloWorker',messageHandler,that.lastPort)
            act.emit(["work"])
            that.lastPort++
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
    }
}