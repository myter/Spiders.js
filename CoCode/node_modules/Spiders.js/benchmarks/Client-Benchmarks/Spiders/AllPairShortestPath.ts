import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 01/02/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Worker extends spiders.Actor{
    myBlockId                   = null
    blockSize                   = null
    numNodes                    = null
    W                           = null
    neighbours                  = []
    graphData                   = null
    numBlocksInSingleDim        = null
    numNeighbors                = null
    rowOffset                   = null
    colOffset                   = null
    k                           = -1
    neighborDataPerIteration    = []
    receivedNeighbors           = false
    currentIterData             = null
    dataCollected               = 0

    config(myBlockId,blockSize,numNodes,W) {
        this.myBlockId = myBlockId
        this.blockSize = blockSize
        this.numNodes = numNodes
        this.W = W
        var localData = []
        for (var i = 0; i < numNodes; i++) {
            localData[i] = {}
            for (var j = 0; j < numNodes; j++) {
                if (!(j in localData)) {
                    localData[j] = {}
                }
                localData[i][j] = 0
                localData[j][i] = 0
            }
        }
        for (var i = 0; i < numNodes; i++) {
            for (var j = i + 1; j < numNodes; j++) {
                var r = Math.floor(Math.random() * (W - 0) + 0)
                localData[i][j] = r
                localData[j][i] = r
            }
        }
        this.graphData = localData
        this.numBlocksInSingleDim = Math.floor(numNodes / blockSize)
        this.numNeighbors = 2 * (this.numBlocksInSingleDim - 1)
        this.rowOffset = (Math.floor(myBlockId / this.numBlocksInSingleDim)) * blockSize
        this.colOffset = (myBlockId % this.numBlocksInSingleDim) * blockSize
        this.currentIterData = this.getBlock(this.graphData, myBlockId)
    }

    newNeighbour(neighbourRef) {
        this.neighbours.push(neighbourRef)
    }

    configDone() {
        this.parent.actorInit()
    }

    getBlock(data,id) {
        var blockSize = this.blockSize
        var localData = []
        for (var i = 0; i < blockSize; i++) {
            localData[i] = []
            for (var j = 0; j < blockSize; j++) {
                if (!(j in localData)) {
                    localData[j] = []
                }
                localData[i][j] = 0
                localData[j][i] = 0
            }
        }
        var numBlocksPerDim = Math.floor(this.numNodes / blockSize)
        var globalStartRow = (Math.floor(id / numBlocksPerDim)) * blockSize
        var globalStartCol = (id % numBlocksPerDim) * blockSize
        for (var i = 0; i < blockSize; i++) {
            for (var j = 0; j < blockSize; j++) {
                var point = data[i + globalStartRow][j + globalStartCol]
                localData[i][j] = point
            }
        }
        return localData
    }

    notifyNeighbours() {
        var currentIterData = this.currentIterData
        var neighbours = this.neighbours
        var k = this.k
        var myBlockId = this.myBlockId
        neighbours.forEach((neighbour)=>{
            currentIterData.forEach((row,i)=>{
                row.forEach((el,z)=>{
                    neighbour.storeIterationData(k, myBlockId, i, z, el)
                })
            })
            neighbour.resultsDone()
        })
    }

    storeIterationData(k,id,colId,rowId,dataPoint) {
        var neighborDataPerIteration = this.neighborDataPerIteration
        if (!(id in neighborDataPerIteration)) {
            neighborDataPerIteration[id] = []
        }
        if (!(colId in neighborDataPerIteration[id])) {
            neighborDataPerIteration[id][colId] = []
        }
        neighborDataPerIteration[id][colId][rowId] = dataPoint
        this.neighborDataPerIteration = neighborDataPerIteration
    }

    elementAt(row,col,srcIter,prevIterData) {
        var blockSize = this.blockSize
        var destBlockId = ((Math.floor(row / blockSize)) * this.numBlocksInSingleDim) + (Math.floor(col / blockSize))
        var localRow = row % blockSize
        var localCol = col % blockSize
        if (destBlockId == this.myBlockId) {
            return prevIterData[localRow][localCol]
        }
        else {
            var blockData = this.neighborDataPerIteration[destBlockId]
            if (typeof blockData == 'undefined' || typeof blockData[localRow] == 'undefined') {
                return 0
            }
            else {
                return blockData[localRow][localCol]
            }
        }
    }

    performComputation() {
        var currentIterData = []
        var blockSize = this.blockSize
        var prevIterData = this.currentIterData
        var rowOffset   = this.rowOffset
        var colOffset = this.colOffset
        var k = this.k
        for (var i = 0; i < blockSize; i++) {
            currentIterData[i] = []
            for (var j = 0; j < blockSize; j++) {
                if (!(j in currentIterData)) {
                    currentIterData[j] = []
                }
                currentIterData[i][j] = 0
                currentIterData[j][i] = 0
            }
        }
        for (var i = 0; i < blockSize; i++) {
            for (var j = 0; j < blockSize; j++) {
                var gi = rowOffset + i
                var gj = colOffset + j
                var newIterData = this.elementAt(gi, k, k - 1, prevIterData) + this.elementAt(k, gj, k - 1, prevIterData)
                var newElement = Math.min(prevIterData[i][j], newIterData)
                currentIterData[i][j] = newElement
            }
        }
        this.currentIterData = currentIterData
    }

    start() {
        this.notifyNeighbours()
    }

    resultsDone() {
        this.dataCollected += 1
        if (this.dataCollected == this.numNeighbors) {
            this.k += 1
            this.performComputation()
            this.notifyNeighbours()
            this.neighborDataPerIteration = []
            this.dataCollected = 0
            if (this.k == (this.numNodes - 1)) {
                this.parent.actorExit()
            }
        }
    }
}

class AllPairShortestPathApp extends spiders.Application{
    actorsInitialised       = 0
    actorsExited            = 0
    numBlocksInSingleDim
    blockActors
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        var numNodes 				= BenchConfig.apspN
        var blockSize 				= BenchConfig.apspB
        this.numBlocksInSingleDim 	= Math.floor(numNodes / blockSize)
        var numBlocksInSingleDim    = this.numBlocksInSingleDim
        var blockActors 			= []
        for(var i = 0; i < numBlocksInSingleDim;i++){
            blockActors[i] = []
            for(var j = 0;j < numBlocksInSingleDim;j++){
                var myBlockId = (i * numBlocksInSingleDim) + j
                var workerRef = this.spawnActor(Worker)
                workerRef.config(myBlockId,blockSize,numNodes,BenchConfig.apspW)
                blockActors[i][j] = workerRef
            }
        }
        for(var bi = 0;bi < numBlocksInSingleDim;bi++){
            for(var bj = 0;bj < numBlocksInSingleDim;bj++){
                var neighbours = []
                for(var r = 0;r < numBlocksInSingleDim;r++){
                    if(r != bi){
                        neighbours.push(blockActors[r][bj])
                    }
                }
                for(var c = 0;c < numBlocksInSingleDim;c++){
                    if(c != bj){
                        neighbours.push(blockActors[bi][c])
                    }
                }
                var current = blockActors[bi][bj]
                for(var k in neighbours){
                    current.newNeighbour(neighbours[k])
                }
            }
        }
        for(var bi = 0;bi < numBlocksInSingleDim;bi++){
            for(var bj = 0;bj < numBlocksInSingleDim;bj++){
                blockActors[bi][bj].configDone()
            }
        }
        this.blockActors = blockActors
    }


    checkConfig() {
        var numBlocksInSingleDim = this.numBlocksInSingleDim
        var blockActors = this.blockActors
        if (this.actorsInitialised == numBlocksInSingleDim * numBlocksInSingleDim) {
            for (var bi = 0; bi < numBlocksInSingleDim; bi++) {
                for (var bj = 0; bj < numBlocksInSingleDim; bj++) {
                    blockActors[bi][bj].start()
                }
            }
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    actorExit() {
        this.actorsExited += 1
        if (this.actorsExited == this.numBlocksInSingleDim * this.numBlocksInSingleDim) {
            this.bench.stopPromise.resolve()
        }
    }
}

export class SpiderAllPairShortestPathBench extends SpiderBenchmark{
    allPairShortestPathApp
    constructor(){
        super("Spiders.js All Pair Shortest Path","Spiders.js All Pair Shortest Path cycle completed","Spiders.js All Pair Shortest Path completed","Spiders.js All Pair Shortest Path scheduled")
    }

    runBenchmark(){
        this.allPairShortestPathApp = new AllPairShortestPathApp(this)
        this.allPairShortestPathApp.setup()
    }

    cleanUp(){
        this.allPairShortestPathApp.kill()
        this.allPairShortestPathApp.blockActors = []
    }
}