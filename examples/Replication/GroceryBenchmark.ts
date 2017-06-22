import {PubSubLib} from "../../src/PubSub/PubSub";
import {PubSubServer} from "../../src/PubSub/SubServer";
import {GroceryClient} from "./GroceryList";
import {SpiderLib} from "../../src/spiders";
/**
 * Created by flo on 16/04/2017.
 */
var spiders : SpiderLib = require("../../src/spiders")
var pubSub  : PubSubLib = require("../../src/PubSub/PubSub")
var Benchmark = require('benchmark')

class GroceryBenchmark extends PubSubServer{
    clients
    totalClients
    opPerClient
    clientsDone
    stopPromise
    list
    items
    name

    spawnClient(id){
        let client = this.spawnActor(GroceryClient)
        this.clients.set(id,client)
        return client
    }

    constructor(nrClients,operationPerClient){
        super()
        this.name           = nrClients.toString() +  " : " + operationPerClient.toString()
        this.clients        = new Map()
        this.opPerClient    = operationPerClient
        this.clientsDone    = 0
        this.totalClients   = nrClients
        this.items          = []
        this.list           = "benchList"

    }

    setup(){
        for(var i = 0;i < this.opPerClient * this.totalClients;i++){
            this.items.push(i.toString())
        }
        for(var j = 0;j < this.totalClients;j++){
            let c = this.spawnClient(j)
            c.termination(new spiders.ArrayIsolate(this.items))
        }
        this.clients.get(0).newList(this.list)
    }

    setBenchDone(stopPromise){
        this.stopPromise = stopPromise
    }

    clientDone(){
        this.clientsDone += 1
        if(this.clientsDone == this.totalClients){
            this.stopPromise.resolve()
        }
    }

    run(){
        setTimeout(()=>{
            let clientId    = 0
            let client      = this.clients.get(clientId)
            for(var i = 0;i < this.items.length;i++){
                client.addItem(this.list,i.toString())
                if(i % this.opPerClient == 0 && i != 0){
                    clientId    += 1
                    client      = this.clients.get(clientId)
                }
            }
        },2000)
    }

    cleanUp(){
        (this as any).spawnedActors.forEach((actor) => {
            actor.kill()
        })
        this.clients        = new Map()
        this.clientsDone    = 0
        this.items          = []
    }
}

class BenchmarkRunner{
    scheduled
    currentBench


    constructor(){
        this.scheduled = []
    }

    schedule(groceryBench){
        var that = this
        var bench = new Benchmark(groceryBench.name,{
            defer: true,
            async: true,
            fn: function(deffered){
                groceryBench.setBenchDone(deffered)
                groceryBench.run()
            },
            teardown: function(){
                groceryBench.cleanUp()
            },
            setup: function(){
                groceryBench.setup()
            },
            onCycle: function(){
                console.log(groceryBench.name +  " cycle completed")
                // console.log("Current mean: " + (this as any).stats.mean)
            },
            onComplete: function(){
                console.log(groceryBench.name + " completed")
                console.log("Total time: " + ((this as any).stats.mean - 2));
                console.log("Error margin: " + ((this as any).stats.moe))
                groceryBench.kill()
                that.nextBenchmark()
            },
        })
        this.scheduled.push(bench)
        //console.log(spiderBench.scheduleMessage)
    }

    nextBenchmark(){
        this.currentBench += 1
        if(this.scheduled.length != 0){
            this.scheduled.pop().run()
        }
    }
}

let runner = new BenchmarkRunner()
//runner.schedule(new GroceryBenchmark(5,1))
//runner.schedule(new GroceryBenchmark(5,5))
//runner.schedule(new GroceryBenchmark(5,10))
//runner.schedule(new GroceryBenchmark(5,15))
//runner.schedule(new GroceryBenchmark(5,20))
//runner.schedule(new GroceryBenchmark(5,25))
//runner.schedule(new GroceryBenchmark(5,30))
//runner.schedule(new GroceryBenchmark(5,35))
//runner.schedule(new GroceryBenchmark(5,40))
//runner.schedule(new GroceryBenchmark(5,45))
runner.schedule(new GroceryBenchmark(5,50))
runner.nextBenchmark()