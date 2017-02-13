import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
export class NodeRadixSortBench extends SpiderBenchmark{
    static _SOURCE_PORT_ = 8001
    static _VALID_PORT_ = 8002
    lastPort = 8003
    sourceRef : ClientBufferSocket
    validRef : ClientBufferSocket
    allActors : Array<ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Radix Sort","Node Radix Sort cycle completed","Node Radix Sort completed","Node Radix Sort scheduled")
        this.allActors = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var actorsExited        = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == totalActors){
                    nextActor.emit(["link",NodeRadixSortBench._SOURCE_PORT_])
                    that.sourceRef.emit(["nextActor",nextPort])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function actorExit(){
                actorsExited += 1
                if(actorsExited == totalActors){
                    that.stopPromise.resolve()
                }
            }

            function end(){
                that.stopPromise.resolve()
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "actorExit":
                    actorExit()
                    break;
                case "end":
                    end()
                    break;
                default :
                    console.log("Unknown message: " + data[0])
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        that.sourceRef = that.spawnNode("Radix-Sort/RadixSortSource",sysHandle,NodeRadixSortBench._SOURCE_PORT_)
        that.sourceRef.emit(["config",BenchConfig.radixSortDataSize,BenchConfig.radixSortMaxVal])
        that.validRef = that.spawnNode("Radix-Sort/RadixSortValidation",sysHandle,NodeRadixSortBench._VALID_PORT_)
        that.validRef.emit(["config",BenchConfig.radixSortDataSize])
        var totalActors = 2
        var radix 		= Math.floor(BenchConfig.radixSortMaxVal /  2)
        var nextActor 	= that.validRef
        var nextPort    = NodeRadixSortBench._VALID_PORT_
        while(Math.floor(radix) > 0){
            var localRadix 		= radix
            var localNextActor 	= nextActor
            var localNextPort   = nextPort
            var sortRef 		= that.spawnNode("Radix-Sort/RadixSortSort",sysHandle,that.lastPort)
            that.allActors.push(sortRef)
            localNextActor.emit(["link",that.lastPort])
            sortRef.emit(["config",BenchConfig.radixSortDataSize,localRadix,localNextPort])
            radix 				= radix / 2
            totalActors			+= 1
            nextActor 			= sortRef
            nextPort            = that.lastPort
            that.lastPort++
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.allActors = []
    }
}