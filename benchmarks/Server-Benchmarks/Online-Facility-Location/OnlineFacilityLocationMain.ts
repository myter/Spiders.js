import {SpiderBenchmark, ClientBufferSocket, ServerBufferSocket, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
export class NodeFacilityLocationBench extends SpiderBenchmark{
    static _PROD_PORT_ = 8001
    static _QUAD_PORT_ = 8002
    lastPort = 8003
    spawned : Map<number,ClientBufferSocket>
    prodRef : ClientBufferSocket
    quadRef : ClientBufferSocket
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Facility Location","Node Facility Location cycle completed","Node Facility Location completed","Node Facility Location scheduled")
        this.spawned = new Map()
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var totalSpawned        = 2
        var actorsExited        = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == 2){
                    that.prodRef.emit(["produceConsumer"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function actorExit(){
                actorsExited += 1
                if(actorsExited == totalSpawned){
                    that.stopPromise.resolve()
                }
            }

            function spawnQuad(index,positionToParent,bx1,by1,bx2,by2,threshold,depth,initKnownFacilities,initMaxDepthOpenFac,parentPort){
                var parent = that.spawned.get(parentPort)
                var ref = that.spawnNode("Online-Facility-Location/OnlineFacilityLocationQuadrant",sysHandle,that.lastPort)
                that.spawned.set(that.lastPort,ref)
                ref.emit(["config",false,positionToParent,bx1,by1,bx2,by2,threshold,depth,initKnownFacilities,initMaxDepthOpenFac,parentPort])
                parent.emit(["childQuadSpawned",index])
                that.lastPort++
                totalSpawned += 1
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "actorExit":
                    actorExit()
                    break;
                case "spawnQuad":
                    spawnQuad(data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10],data[11])
                    break;
                default :
                    console.log("Unknown message (System): " + data[0])
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        var threshold 	= BenchConfig.facLocAlpha * BenchConfig.facLocF
        that.quadRef    = that.spawnNode("Online-Facility-Location/OnlineFacilityLocationQuadrant",sysHandle,NodeFacilityLocationBench._QUAD_PORT_)
        that.spawned.set(NodeFacilityLocationBench._QUAD_PORT_,that.quadRef)
        that.quadRef.emit(["config",true,"ROOT",0,0,BenchConfig.facLocGridSize,BenchConfig.facLocGridSize,threshold,0,1,-1])
        that.quadRef.emit(["configDone",false])
        that.prodRef    = that.spawnNode("Online-Facility-Location/OnlineFacilityLocationProducer",sysHandle,NodeFacilityLocationBench._PROD_PORT_)
        that.quadRef.emit(["link",NodeFacilityLocationBench._PROD_PORT_])
        that.prodRef.emit(["config",BenchConfig.facLocGridSize,BenchConfig.facLocNumPoints,NodeFacilityLocationBench._QUAD_PORT_])
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.spawned = new Map()
    }
}