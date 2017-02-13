import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
export class NodeUnbalancedCobwebbedTreeBench extends SpiderBenchmark{
    static _ROOT_PORT_ = 8001
    lastPort = 8002
    spawned : Map<number,ClientBufferSocket>
    rootRef : ClientBufferSocket
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Unbalanced Cobwebbed Tree","Node Unbalanced Cobwebbed Tree cycle completed","Node Unbalanced Cobwebbed Tree completed","Node Unbalanced Cobwebbed Tree scheduled")
        this.spawned = new Map()
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var totalSpawned        = 1
        var totalEnded          = 0
        var nodeInfo            = {}
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == 1){
                    that.rootRef.emit(["generateTree"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }

            function spawnNodeP1(rootPort,height,id,comp,urgent,partId){
                nodeInfo[partId] = [rootPort,height,id,comp,urgent]
            }

            function spawnNodeP2(partId,parentPort){
                var nodeRef = that.spawnNode("Unbalanced-Cobwebbed-Tree/UnbalancedCobwebbedTreeNode",sysHandle,that.lastPort)
                var parent = that.spawned.get(parentPort)
                var rootPort = nodeInfo[partId][0]
                var height 	= nodeInfo[partId][1]
                var id 	   	= nodeInfo[partId][2]
                var comp 	= nodeInfo[partId][3]
                var urgent 	= nodeInfo[partId][4]
                that.spawned.set(that.lastPort,nodeRef)
                nodeRef.emit(["linkParent",parentPort])
                nodeRef.emit(["config",height,id,comp,urgent,BenchConfig.uctBinomial,NodeUnbalancedCobwebbedTreeBench._ROOT_PORT_])
                parent.emit(["childSpawned",that.lastPort])
                that.lastPort++
                totalSpawned += 1
            }

            function endNode(id){
                totalEnded += 1
                if(totalEnded == totalSpawned){
                    end()
                }
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "end":
                    end()
                    break;
                case "spawnNodeP1":
                    spawnNodeP1(data[6],data[1],data[2],data[3],data[4],data[5])
                    break;
                case "spawnNodeP2":
                    spawnNodeP2(data[1],data[2])
                    break;
                case "endNode":
                    endNode(data[1])
                    break;
                default :
                    console.log("Unknown message (System): " + data[0])
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        that.rootRef = that.spawnNode("Unbalanced-Cobwebbed-Tree/UnbalancedCobwebbedTreeRoot",sysHandle,NodeUnbalancedCobwebbedTreeBench._ROOT_PORT_)
        that.spawned.set(NodeUnbalancedCobwebbedTreeBench._ROOT_PORT_,that.rootRef)
        that.rootRef.emit(["config",BenchConfig.uctMaxNodes,BenchConfig.uctAvgCompSize,BenchConfig.uctStdevCompSize,BenchConfig.uctBinomial,BenchConfig.uctPercent])
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.spawned = new Map()
    }
}