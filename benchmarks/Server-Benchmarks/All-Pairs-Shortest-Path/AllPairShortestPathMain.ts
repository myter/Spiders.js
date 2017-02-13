import {BenchConfig, SpiderBenchmark, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
export class NodeAllPairShortestPathBench extends SpiderBenchmark{
    lastPort = 8001
    allActors : Array<ClientBufferSocket>
    blockActors
    blockPorts
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node All Pair Shortest Path","Node All Pair Shortest Path cycle completed","Node All Pair Shortest Path completed","Node All Pair Shortest Path scheduled")
        this.allActors = []
        this.blockActors = {}
        this.blockPorts = {}
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var actorsExited        = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == numBlocksInSingleDim * numBlocksInSingleDim){
                    for(var bi = 0;bi < numBlocksInSingleDim;bi++){
                        for(var bj = 0;bj < numBlocksInSingleDim;bj++){
                            that.blockActors[bi][bj].emit(["start"])
                        }
                    }
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function actorExit(){
                actorsExited += 1
                if(actorsExited == numBlocksInSingleDim * numBlocksInSingleDim){
                    that.stopPromise.resolve()
                }
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "actorExit":
                    actorExit()
                    break;
                default :
                    console.log("Unknown message (System): " + data[0])
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        var numNodes 				= BenchConfig.apspN
        var blockSize 				= BenchConfig.apspB
        var numBlocksInSingleDim 	= Math.floor(numNodes / blockSize)
        for(var i = 0; i < numBlocksInSingleDim;i++){
            that.blockActors[i]  = {}
            that.blockPorts[i] = {}
            for(var j = 0;j < numBlocksInSingleDim;j++){
                var myBlockId = (i * numBlocksInSingleDim) + j
                var workerRef = that.spawnNode("All-Pairs-Shortest-Path/AllPairShortestPathWorker",sysHandle,that.lastPort)
                that.allActors.push(workerRef)
                workerRef.emit(["config",myBlockId,blockSize,numNodes,BenchConfig.apspW])
                that.blockActors[i][j] = workerRef
                that.blockPorts[i][j] = that.lastPort
                that.lastPort++
            }
        }
        for(var bi = 0;bi < numBlocksInSingleDim;bi++){
            for(var bj = 0;bj < numBlocksInSingleDim;bj++){
                var neighbours = []
                var neighbourPorts = []
                for(var r = 0;r < numBlocksInSingleDim;r++){
                    if(r != bi){
                        neighbours.push(that.blockActors[r][bj])
                        neighbourPorts.push(that.blockPorts[r][bj])
                    }
                }
                for(var c = 0;c < numBlocksInSingleDim;c++){
                    if(c != bj){
                        neighbours.push(that.blockActors[bi][c])
                        neighbourPorts.push(that.blockPorts[bi][c])
                    }
                }
                var current = that.blockActors[bi][bj]
                var currentPort = that.blockPorts[bi][bj]
                for(var k in neighbours){
                    current.emit(["newNeighbour",neighbourPorts[k]])
                    neighbours[k].emit(["link",currentPort])
                }
            }
        }
        for(var bi = 0;bi < numBlocksInSingleDim;bi++){
            for(var bj = 0;bj < numBlocksInSingleDim;bj++){
                that.blockActors[bi][bj].emit(["configDone"])
            }
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.allActors = []
        this.blockActors = {}
    }
}