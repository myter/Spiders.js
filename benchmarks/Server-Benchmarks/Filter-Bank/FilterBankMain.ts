import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
export class NodeFilterBankBench extends SpiderBenchmark{
    static _PRODUCER_PORT_ = 8001
    static _SINK_PORT_ = 8002
    static _COMBINE_PORT_ = 8003
    static _INTEGRATE_PORT_ = 8004
    static _BRANCHES_PORT_ = 8005
    static _SOURCE_PORT_ = 8006
    lastPort = 8007
    producerRef : ClientBufferSocket
    sinkRef : ClientBufferSocket
    combineRef : ClientBufferSocket
    integrateRef : ClientBufferSocket
    branchesRef : ClientBufferSocket
    sourceRef : ClientBufferSocket
    miscActors : Array<ClientBufferSocket>
    mainPort : ServerBufferSocket

    constructor(){
        super("Node Filter Bank","Node Filter Bank cycle completed","Node Filter Bank completed","Node Filter Bank scheduled")
        this.miscActors = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == 6 + BenchConfig.filterBankChannels + BenchConfig.filterBankChannels * 6){
                    that.producerRef.emit(["nextMessage"])
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
                    console.log("Unknown message (System): " + data[0])
            }
        }
        that.mainPort               = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        that.producerRef            = that.spawnNode("Filter-Bank/FilterBankProducer",sysHandle,NodeFilterBankBench._PRODUCER_PORT_)
        that.sinkRef                = that.spawnNode("Filter-Bank/FilterBankSink",sysHandle,NodeFilterBankBench._SINK_PORT_)
        that.combineRef             = that.spawnNode("Filter-Bank/FilterBankCombine",sysHandle,NodeFilterBankBench._COMBINE_PORT_)
        that.sinkRef.emit(["link",NodeFilterBankBench._COMBINE_PORT_])
        that.combineRef.emit(["config",NodeFilterBankBench._SINK_PORT_])
        that.integrateRef           = that.spawnNode("Filter-Bank/FilterBankIntegrator",sysHandle,NodeFilterBankBench._INTEGRATE_PORT_)
        that.combineRef.emit(["link",NodeFilterBankBench._INTEGRATE_PORT_])
        that.integrateRef.emit(["config",BenchConfig.filterBankChannels,NodeFilterBankBench._COMBINE_PORT_])
        that.branchesRef            = that.spawnNode("Filter-Bank/FilterBankBranch",sysHandle,NodeFilterBankBench._BRANCHES_PORT_)
        that.integrateRef.emit(["link",NodeFilterBankBench._BRANCHES_PORT_])
        that.branchesRef.emit(["config",NodeFilterBankBench._INTEGRATE_PORT_])
        var H = {}
        var F = {}
        for(var j = 0; j < BenchConfig.filterBankChannels;j++){
            H[j] = {}
            F[j] = {}
            for(var i = 0; i < BenchConfig.filterBankColumns;i++){
                H[j][i] = (1.0 * i * BenchConfig.filterBankColumns) + (1.0 * j * BenchConfig.filterBankChannels) + j + i + j + 1;
                F[j][i] = (1.0 * i * j) + (1.0 * j * j) + j + i
            }
        }
        for(var i = 0;i < BenchConfig.filterBankChannels;i++){
            var taggedPort = that.lastPort
            that.lastPort++
            var taggedRef = that.spawnNode("Filter-Bank/FilterBankTaggedForward",sysHandle,taggedPort)
            that.miscActors.push(taggedRef)
            that.integrateRef.emit(["link",taggedPort])
            taggedRef.emit(["config",i,NodeFilterBankBench._INTEGRATE_PORT_])
            var firFilt2Port = that.lastPort
            that.lastPort++
            var firFilt2Ref = that.spawnNode("Filter-Bank/FilterBankFirFilter",sysHandle,firFilt2Port)
            that.miscActors.push(firFilt2Ref)
            taggedRef.emit(["link",firFilt2Port])
            firFilt2Ref.emit(["config",i + ".2",BenchConfig.filterBankColumns,taggedPort])
            for(var c in F[i]){
                firFilt2Ref.emit(["newCoef",F[i][c]])
            }
            firFilt2Ref.emit(["configDone"])
            var delayPort = that.lastPort
            that.lastPort++
            var delayRef = that.spawnNode("Filter-Bank/FilterBankDelay",sysHandle,delayPort)
            that.miscActors.push(delayRef)
            firFilt2Ref.emit(["link",delayPort])
            delayRef.emit(["config",i + ".2",BenchConfig.filterBankColumns - 1,firFilt2Port])
            var samplePort = that.lastPort
            that.lastPort++
            var sampleFiltRef = that.spawnNode("Filter-Bank/FilterBankSampleFilter",sysHandle,samplePort)
            that.miscActors.push(sampleFiltRef)
            delayRef.emit(["link",samplePort])
            sampleFiltRef.emit(["config",BenchConfig.filterBankColumns,delayPort])
            var firFiltPort = that.lastPort
            that.lastPort++
            var firFiltRef = that.spawnNode("Filter-Bank/FilterBankFirFilter",sysHandle,firFiltPort)
            that.miscActors.push(firFiltRef)
            sampleFiltRef.emit(["link",firFiltPort])
            firFiltRef.emit(["config",i + ".1",BenchConfig.filterBankColumns,samplePort])
            for(var c in H[i]){
                firFiltRef.emit(["newCoef",H[i][c]])
            }
            firFiltRef.emit(["configDone"])
            var firstPort = that.lastPort
            that.lastPort++
            var firstRef = that.spawnNode("Filter-Bank/FilterBankDelay",sysHandle,firstPort)
            that.miscActors.push(firstRef)
            firFiltRef.emit(["link",firstPort])
            firstRef.emit(["config",i + ".1",BenchConfig.filterBankColumns -1,firFiltPort])
            var bankPort = that.lastPort
            that.lastPort++
            var bankRef = that.spawnNode("Filter-Bank/FilterBankBank",sysHandle,bankPort)
            that.miscActors.push(bankRef)
            that.integrateRef.emit(["link",bankPort])
            firstRef.emit(["link",bankPort])
            bankRef.emit(["linkFirst",firstPort])
            bankRef.emit(["config",i,BenchConfig.filterBankColumns,NodeFilterBankBench._INTEGRATE_PORT_])
            bankRef.emit(["link",NodeFilterBankBench._BRANCHES_PORT_])
            that.branchesRef.emit(["newBank",bankPort])
        }
        that.branchesRef.emit(["configDone"])
        that.sourceRef = that.spawnNode("Filter-Bank/FilterBankSource",sysHandle,NodeFilterBankBench._SOURCE_PORT_)
        that.producerRef.emit(["link",NodeFilterBankBench._SOURCE_PORT_])
        that.sourceRef.emit(["linkProducer",NodeFilterBankBench._PRODUCER_PORT_])
        that.branchesRef.emit(["link",NodeFilterBankBench._SOURCE_PORT_])
        that.sourceRef.emit(["linkBranches",NodeFilterBankBench._BRANCHES_PORT_])
        that.sourceRef.emit(["configDone"])
        that.sourceRef.emit(["link",NodeFilterBankBench._PRODUCER_PORT_])
        that.producerRef.emit(["config",BenchConfig.filterBankSimulations,NodeFilterBankBench._SOURCE_PORT_])
    }

    cleanUp(){
        this.cleanNodes()
        this.mainPort.close()
        this.miscActors = []
    }
}