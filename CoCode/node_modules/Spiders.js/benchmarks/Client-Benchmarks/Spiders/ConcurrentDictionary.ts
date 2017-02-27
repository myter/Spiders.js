import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Worker extends spiders.Actor{
    masterRef           = null
    dictRef             = null
    writePercentage     = 0
    totalMsgs           = 0
    currentMsgs         = 0

    init(){
        this.parent.actorInit()
    }

    config(masterRef,dictRef,writePercentage,totalMsgs) {
        this.writePercentage    = writePercentage
        this.totalMsgs          = totalMsgs
        this.masterRef          = masterRef
        this.dictRef            = dictRef
    }

    getRandom() {
        return Math.floor(Math.random() * (100 - 0 + 1)) + 0;
    }

    work() {
        this.currentMsgs += 1
        if (this.currentMsgs <= this.totalMsgs) {
            var rand = this.getRandom()
            if (rand < this.writePercentage) {
                var key = this.getRandom()
                var val = this.getRandom()
                this.dictRef.write(this, key, val)
            }
            else {
                var key = this.getRandom()
                this.dictRef.read(this, key)
            }
        }
        else {
            this.masterRef.workerDone()
        }
    }
}

class Master extends spiders.Actor{
    totalWorkers    = 0
    workersDone     = 0

    init() {
        this.parent.actorInit()
    }

    config(totalWorkers) {
        this.totalWorkers = totalWorkers
    }

    workerDone() {
        this.workersDone += 1
        if (this.workersDone == this.totalWorkers) {
            this.parent.end()
        }
    }
}

class Dictionary extends spiders.Actor{
    data = {}

    init() {
        this.parent.actorInit()
    }

    write(sender,key,val) {
        this.data[key] = val
        sender.work()
    }

    read(sender,key) {
        var val = this.data[key]
        sender.work()
    }
}

class ConcurrentDictionaryApp extends spiders.Application{
    actorsInitialised   = 0
    actors              = []
    dictRef
    masterRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        this.dictRef     = this.spawnActor(Dictionary)
        this.masterRef   = this.spawnActor(Master)
        this.masterRef.config(BenchConfig.cDictActors)
        var count = BenchConfig.cDictActors
        while(count > 0){
            var newActor = this.spawnActor(Worker)
            this.actors.push(newActor)
            count -= 1
        }
    }

    checkConfig() {
        //+ 2 for dictionary and master
        if (this.actorsInitialised == BenchConfig.cDictActors + 2) {
            for (var i in this.actors) {
                this.actors[i].config(this.masterRef,this.dictRef,BenchConfig.cDictWrite, BenchConfig.cDictMsgs)
                this.actors[i].work()
            }
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    end() {
        this.bench.stopPromise.resolve()
    }
}

export class SpiderConcurrentDictionaryBench extends SpiderBenchmark{
    concurrentDictionaryApp
    constructor(){
        super("Spiders.js Concurrent Dictionary","Spiders.js Concurrent Dictionary cycle completed","Spiders.js Concurrent Dictionary completed","Spiders.js Concurrent Dictionary scheduled")
    }

    runBenchmark(){
        this.concurrentDictionaryApp = new ConcurrentDictionaryApp(this)
        this.concurrentDictionaryApp.setup()
    }

    cleanUp(){
        this.concurrentDictionaryApp.kill()
        this.concurrentDictionaryApp.actors = []
    }
}