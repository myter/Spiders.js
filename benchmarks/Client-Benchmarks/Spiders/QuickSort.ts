import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 01/02/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Quick extends spiders.Actor{
    dataSize        = null
    maxVal          = null
    threshold       = null
    parentRef       = null
    position        = null
    data            = []
    result          = []
    numFragments 	= 0
    exited          = false

    config(hasParent,dataSize,maxVal,threshold,parentRef,position) {
        if (hasParent) {
            this.parentRef = parentRef
        }
        this.dataSize = dataSize
        this.maxVal = maxVal
        this.threshold = threshold
        this.position = position
    }

    newData(dataPoint) {
        this.data.push(dataPoint)
    }

    configDone() {
        this.parent.actorInit()
    }

    sequentialSort(dataCopy) {
        var dataLength = dataCopy.length
        if (dataLength < 2) {
            return dataCopy
        }
        else {
            var pivot = dataCopy[Math.floor(dataLength / 2)]
            var leftUnsorted = this.filterLessThan(dataCopy, pivot)
            var leftSorted = this.sequentialSort(leftUnsorted)
            var equalElements = this.filterEqualsTo(dataCopy, pivot)
            var rightUnsorted = this.filterGreaterThan(dataCopy, pivot)
            var rightSorted = this.sequentialSort(rightUnsorted)
            var sorted = []
            for (var i in rightUnsorted) {
                sorted.push(rightUnsorted[i])
            }
            for (var i in equalElements) {
                sorted.push(equalElements[i])
            }
            for (var i in leftUnsorted) {
                sorted.push(leftUnsorted[i])
            }
            return sorted
        }
    }

    notifyParentAndTerminate() {
        if (this.parentRef != null) {
            this.parentRef.gotResult(this.result, this.position)
        }
        else {
            this.parent.end()
        }
        this.exited = true
    }

    filterLessThan(dataCopy,pivot) {
        var dataLength = dataCopy.length
        var result = []
        for (var i in dataCopy) {
            if (dataCopy[i] < pivot) {
                result.push(dataCopy[i])
            }
        }
        return result
    }

    filterGreaterThan(dataCopy,pivot) {
        var dataLength = dataCopy.length
        var result = []
        for (var i in dataCopy) {
            if (dataCopy[i] > pivot) {
                result.push(dataCopy[i])
            }
        }
        return result
    }

    filterEqualsTo(dataCopy,pivot) {
        var dataLength = dataCopy.length
        var result = []
        for (var i in dataCopy) {
            if (dataCopy[i] == pivot) {
                result.push(dataCopy[i])
            }
        }
        return result
    }

    sort() {
        var data = this.data
        if (!this.exited) {
            var dataLength = data.length
            if (dataLength < this.threshold) {
                this.sequentialSort(data)
                this.notifyParentAndTerminate()
            }
            else {
                var dataLengthHalf = dataLength / 2
                var pivot = data[dataLengthHalf]
                var leftUnsorted = this.filterLessThan(data, pivot)
                this.parent.spawnNew(this, "LEFT").then((ref)=>{
                    leftUnsorted.forEach((uns)=>{
                        ref.newData(uns)
                    })
                    ref.configDone()
                    ref.sort()
                })
                var rightUnsorted = this.filterGreaterThan(data, pivot)
                this.parent.spawnNew(this, "RIGHT").then((ref)=> {
                    rightUnsorted.forEach((uns)=>{
                        ref.newData(uns)
                    })
                    ref.configDone()
                    ref.sort()
                })
                this.result = this.filterEqualsTo(data, pivot)
                this.numFragments += 1
            }
        }
    }

    gotResult(result,fromPosition) {
        if (!(this.data.length == 0)) {
            if (fromPosition == "LEFT") {
                var tempLeft = this.result + result
                this.result = tempLeft
            }
            else if (fromPosition == "RIGHT") {
                var tempRight = result + this.result
                this.result = tempRight
            }
        }
        this.numFragments += 1
        if (this.numFragments == 3) {
            this.notifyParentAndTerminate()
        }
    }
}

class QuickSortApp extends spiders.Application{
    actorsInitialised   = 0
    totalSpawned        = 1
    quickRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        this.quickRef = this.spawnActor(Quick)
        this.quickRef.config(false,BenchConfig.quickDataSize,BenchConfig.quickMaxVal,BenchConfig.quickThreshold,0,"INITIAL")
        for(var i = 0;i < BenchConfig.quickDataSize;i++){
            var data = Math.floor(Math.random() * (BenchConfig.quickMaxVal - 0) + 0) % BenchConfig.quickMaxVal
            this.quickRef.newData(data)
        }
        this.quickRef.configDone()
    }

    checkConfig() {
        if (this.actorsInitialised == 1) {
            this.quickRef.sort()
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    end() {
        this.bench.stopPromise.resolve()
    }

    spawnNew(parentRef,position) {
        var qRef = this.spawnActor(Quick)
        qRef.config(true, BenchConfig.quickDataSize, BenchConfig.quickMaxVal, BenchConfig.quickThreshold, parentRef, position)
        this.totalSpawned += 1
        return qRef
    }
}

export class SpiderQuickSortBench extends SpiderBenchmark{
    quickSortApp
    constructor(){
        super("Spiders.js Quick Sort","Spiders.js Quick Sort cycle completed","Spiders.js Quick Sort completed","Spiders.js Quick Sort scheduled")
    }

    runBenchmark(){
        this.quickSortApp = new QuickSortApp(this)
        this.quickSortApp.setup()
    }

    cleanUp(){
        this.quickSortApp.kill()
    }
}