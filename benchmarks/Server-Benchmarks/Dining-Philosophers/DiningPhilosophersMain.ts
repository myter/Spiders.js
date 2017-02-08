import {ClientBufferSocket, SpiderBenchmark, BenchConfig, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
export class NodeDiningPhilosopherBench extends SpiderBenchmark{
    static _WAITER_PORT_ = 8001
    lastPort = 8002
    waiterRef : ClientBufferSocket
    philosophers : Array<ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Dining Philosophers","Node Dining Philosophers cycle completed","Node Dining Philosophers completed","Node Dining Philosophers scheduled")
        this.philosophers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.philosopherActors + 1){
                    for(var i in that.philosophers){
                        that.philosophers[i].emit(["start"])
                    }
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
        that.waiterRef = that.spawnNode("Dining-Philosophers/DiningPhilosopherWaiter",sysHandle,NodeDiningPhilosopherBench._WAITER_PORT_)
        that.waiterRef.emit(["config",BenchConfig.philosopherActors])
        var philCount = BenchConfig.philosopherActors - 1
        while(philCount >= 0){
            var newPhil = that.spawnNode("Dining-Philosophers/DiningPhilosopherPhilosopher",sysHandle,that.lastPort)
            that.waiterRef.emit(["link",that.lastPort])
            newPhil.emit(["config",philCount,BenchConfig.philosopherEating,NodeDiningPhilosopherBench._WAITER_PORT_])
            that.philosophers.push(newPhil)
            that.lastPort++
            philCount -= 1
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.philosophers = []
    }
}