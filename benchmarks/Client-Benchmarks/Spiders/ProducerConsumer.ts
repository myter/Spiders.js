import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Consumer extends spiders.Actor{
    managerRef  = null
    conCost     = 0
    conItem     = 0

    config(managerRef,conCost) {
        this.conCost = conCost
        this.managerRef = managerRef
        this.parent.actorInit()
    }

    getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0 + 1)) + 0;
    }

    processItem(item,cost) {
        var result = item
        var rand = this.getRandom(cost)
        if (cost > 0) {
            for (var i = 0; i < cost; i++) {
                for (var j = 0; j < 100; j++) {
                    result += Math.log(Math.abs(this.getRandom(100)) + 0.01)
                }
            }
        }
        else {
            result += Math.log(Math.abs(this.getRandom(100)) + 0.01)
        }
        return result
    }

    consume(item) {
        this.conItem = this.processItem(this.conItem + item, this.conCost)
        this.managerRef.consumerAvailable(this)
    }
}

class Producer extends spiders.Actor{
    managerRef      = null
    prodItem        = 0.0
    totalItems      = 0
    currentItems    = 0
    prodCost        = 0
    stopped         = false

    config(managerRef,totalItems,prodCost) {
        this.totalItems = totalItems
        this.prodCost = prodCost
        this.managerRef = managerRef
        this.parent.actorInit()
    }

    getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0 + 1)) + 0;
    }

    processItem(item,cost) {
        var result = item
        var rand = this.getRandom(cost)
        if (cost > 0) {
            for (var i = 0; i < cost; i++) {
                for (var j = 0; j < 100; j++) {
                    result += Math.log(Math.abs(this.getRandom(100)) + 0.01)
                }
            }
        }
        else {
            result += Math.log(Math.abs(this.getRandom(100)) + 0.01)
        }
        return result
    }

    produce() {
        if (!(this.stopped)) {
            if (this.currentItems == this.totalItems) {
                this.managerRef.producerStopped()
                this.stopped = true
            }
            else {
                this.prodItem = this.processItem(this.prodItem, this.prodCost)
                this.managerRef.newDataProduced(this, this.prodItem)
                this.currentItems += 1
            }
        }
    }
}

class Manager extends spiders.Actor{
    allConsumers        = []
    availableConsumers  = []
    availableProducers  = []
    totalConsumers      = 0
    totalProducers      = 0
    adjustBuffer        = 0
    producersStopped    = 0
    pendingData         = []

    config(bufferSize,totalConsumers,totalProducers) {
        this.totalConsumers = totalConsumers
        this.totalProducers = totalProducers
        this.adjustBuffer = bufferSize - totalProducers
    }

    registerConsumer(consumerRef) {
        this.availableConsumers.push(consumerRef)
        if (this.availableConsumers.length == this.totalConsumers) {
            this.parent.actorInit()
        }
    }

    newDataProduced(producer,item) {
        if (this.availableConsumers.length == 0) {
            this.pendingData.push(item)
        }
        else {
            var consumer = this.availableConsumers.pop()
            consumer.consume(item)
        }
        if (this.pendingData.length >= this.adjustBuffer) {
            this.availableProducers.push(producer)
        }
        else {
            producer.produce()
        }
    }

    consumerAvailable(consumer) {
        if (this.pendingData.length == 0) {
            this.availableConsumers.push(consumer)
            this.tryExit()
        }
        else {
            var data = this.pendingData.pop()
            consumer.consume(data)
            if (!(this.availableProducers.length == 0)) {
                var producer = this.availableProducers.pop()
                producer.produce()
            }
        }
    }

    producerStopped() {
        this.producersStopped += 1
        this.tryExit()
    }

    tryExit() {
        if (this.producersStopped == this.totalProducers && this.availableConsumers.length == this.totalConsumers) {
            this.parent.end()
        }
    }
}

class ProducerConsumerApp extends spiders.Application{
    actorsInitialised   = 0
    producers           = []
    consumers           = []
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        var managerRef = this.spawnActor(Manager)
        managerRef.config(BenchConfig.prodConBuffer,BenchConfig.prodConCon,BenchConfig.prodConProd)
        var prodCount = BenchConfig.prodConProd
        while(prodCount > 0){
            var newProd = this.spawnActor(Producer)
            newProd.config(managerRef,BenchConfig.prodConItems,BenchConfig.prodConProdCost)
            this.producers.push(newProd)
            prodCount -= 1
        }
        var conCount = BenchConfig.prodConCon
        while(conCount > 0){
            var newCon = this.spawnActor(Consumer)
            newCon.config(managerRef,BenchConfig.prodConConCost)
            managerRef.registerConsumer(newCon)
            this.consumers.push(newCon)
            conCount -= 1
        }
    }

    checkConfig() {
        if (this.actorsInitialised == BenchConfig.prodConProd + BenchConfig.prodConCon + 1) {
            for (var i in this.producers) {
                this.producers[i].produce()
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

export class SpiderProducerConsumerBench extends SpiderBenchmark{
    producerConsumerApp
    constructor(){
        super("Spiders.js Producer Consumer","Spiders.js Producer Consumer cycle completed","Spiders.js Producer Consumer completed","Spiders.js Producer Consumer scheduled")
    }

    runBenchmark(){
        this.producerConsumerApp = new ProducerConsumerApp(this)
        this.producerConsumerApp.setup()
    }

    cleanUp(){
        this.producerConsumerApp.kill()
        this.producerConsumerApp.producers = []
        this.producerConsumerApp.consumers = []
    }
}