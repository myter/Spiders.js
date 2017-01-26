import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 26/01/2017.
 */
export class NatFilterBankBench extends SpiderBenchmark{
    producerRef
    sinkRef
    combineRef
    integrateRef
    branchesRef
    sourceRef
    miscActors

    constructor(){
        super("Native Filter Bank","Native Filter Bank cycle completed","Native Filter Bank completed","Native Filter Bank scheduled")
        this.miscActors = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == 6 + BenchConfig.filterBankChannels + BenchConfig.filterBankChannels * 6){
                    that.producerRef.postMessage(["nextMessage"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }

            switch(event.data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "end":
                    end()
                    break;
                default :
                    console.log("Unknown message (System): " + event.data[0])
            }
        }

        that.producerRef            = that.spawnWorker(require('./FilterBankProducer.js'))
        that.producerRef.onmessage  = sysHandle
        that.sinkRef                = that.spawnWorker(require('./FilterBankSink.js'))
        that.sinkRef.onmessage      = sysHandle
        that.combineRef             = that.spawnWorker(require('./FilterBankCombine.js'))
        that.combineRef.onmessage   = sysHandle
        var c1 = new MessageChannel()
        that.sinkRef.postMessage(["link"],[c1.port2])
        that.combineRef.postMessage(["config"],[c1.port1])
        that.integrateRef           = that.spawnWorker(require('./FilterBankIntegrator.js'))
        that.integrateRef.onmessage = sysHandle
        var c2 = new MessageChannel()
        that.combineRef.postMessage(["link"],[c2.port2])
        that.integrateRef.postMessage(["config",BenchConfig.filterBankChannels],[c2.port1])
        that.branchesRef            = that.spawnWorker(require('./FilterBankBranch.js'))
        that.branchesRef.onmessage  = sysHandle
        var c3 = new MessageChannel()
        that.integrateRef.postMessage(["link"],[c3.port2])
        that.branchesRef.postMessage(["config"],[c3.port1])
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
            var taggedRef = that.spawnWorker(require('./FilterBankTaggedForward.js'))
            that.miscActors.push(taggedRef)
            taggedRef.onmessage = sysHandle
            var c4 = new MessageChannel()
            that.integrateRef.postMessage(["link"],[c4.port2])
            taggedRef.postMessage(["config",i],[c4.port1])
            var firFilt2Ref = that.spawnWorker(require('./FilterBankFirFilter.js'))
            that.miscActors.push(firFilt2Ref)
            firFilt2Ref.onmessage = sysHandle
            var c5 = new MessageChannel()
            taggedRef.postMessage(["link"],[c5.port2])
            firFilt2Ref.postMessage(["config",i + ".2",BenchConfig.filterBankColumns],[c5.port1])
            for(var c in F[i]){
                firFilt2Ref.postMessage(["newCoef",F[i][c]])
            }
            firFilt2Ref.postMessage(["configDone"])
            var delayRef = that.spawnWorker(require('./FilterBankDelay.js'))
            that.miscActors.push(delayRef)
            delayRef.onmessage = sysHandle
            var c6 = new MessageChannel()
            firFilt2Ref.postMessage(["link"],[c6.port2])
            delayRef.postMessage(["config",i + ".2",BenchConfig.filterBankColumns - 1],[c6.port1])
            var sampleFiltRef = that.spawnWorker(require('./FilterBankSampleFilter.js'))
            that.miscActors.push(sampleFiltRef)
            sampleFiltRef.onmessage = sysHandle
            var c7 = new MessageChannel()
            delayRef.postMessage(["link"],[c7.port2])
            sampleFiltRef.postMessage(["config",BenchConfig.filterBankColumns],[c7.port1])
            var firFiltRef = that.spawnWorker(require('./FilterBankFirFilter.js'))
            that.miscActors.push(firFiltRef)
            firFiltRef.onmessage = sysHandle
            var c8 = new MessageChannel()
            sampleFiltRef.postMessage(["link"],[c8.port2])
            firFiltRef.postMessage(["config",i + ".1",BenchConfig.filterBankColumns],[c8.port1])
            for(var c in H[i]){
                firFiltRef.postMessage(["newCoef",H[i][c]])
            }
            firFiltRef.postMessage(["configDone"])
            var firstRef = that.spawnWorker(require('./FilterBankDelay.js'))
            that.miscActors.push(firstRef)
            firstRef.onmessage = sysHandle
            var c9 = new MessageChannel()
            firFiltRef.postMessage(["link"],[c9.port2])
            firstRef.postMessage(["config",i + ".1",BenchConfig.filterBankColumns -1],[c9.port1])
            var bankRef = that.spawnWorker(require('./FilterBankBank.js'))
            that.miscActors.push(bankRef)
            bankRef.onmessage = sysHandle
            var c10 = new MessageChannel()
            var c11 = new MessageChannel()
            that.integrateRef.postMessage(["link"],[c10.port2])
            firstRef.postMessage(["link"],[c11.port2])
            bankRef.postMessage(["linkFirst"],[c11.port1])
            bankRef.postMessage(["config",i,BenchConfig.filterBankColumns],[c10.port1])
            var c12 = new MessageChannel()
            bankRef.postMessage(["link"],[c12.port2])
            that.branchesRef.postMessage(["newBank"],[c12.port1])
        }
        that.branchesRef.postMessage(["configDone"])
        that.sourceRef = that.spawnWorker(require('./FilterBankSource.js'))
        that.sourceRef.onmessage = sysHandle
        var c13 = new MessageChannel()
        that.producerRef.postMessage(["link"],[c13.port2])
        that.sourceRef.postMessage(["linkProducer"],[c13.port1])
        var c14 = new MessageChannel()
        that.branchesRef.postMessage(["link"],[c14.port2])
        that.sourceRef.postMessage(["linkBranches"],[c14.port1])
        that.sourceRef.postMessage(["configDone"])
        var c15 = new MessageChannel()
        that.sourceRef.postMessage(["link"],[c15.port2])
        that.producerRef.postMessage(["config",BenchConfig.filterBankSimulations],[c15.port1])
    }

    cleanUp(){
        this.miscActors.push(this.producerRef,this.sinkRef,this.combineRef,this.integrateRef,this.branchesRef,this.sourceRef)
        this.cleanWorkers(this.miscActors)
        this.miscActors = []
    }
}