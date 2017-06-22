import {SpiderLib} from "../../src/spiders";
import {PubSubLib} from "../../src/PubSub/PubSub";
/**
 * Created by flo on 04/04/2017.
 */
var spiders : SpiderLib = require("../../src/spiders")
var pubSub  : PubSubLib = require("../../src/PubSub/PubSub")

var server = new pubSub.PubSubServer()

class Platform extends pubSub.PubSubClient{
    directory

    constructor(){
        super()
        this.directory = __dirname
    }

    init(){
        let reps    = require(this.directory + '/CarSharingReps')
        let master  = this.newRepliq(reps.PlatformRepliq)
        this.publish(master,reps.PlatformTag)
    }
}

class Customer extends pubSub.PubSubClient{
    directory
    constructor(){
        super()
        this.directory = __dirname
    }
    init(){
        let reps = require(this.directory + '/CarSharingReps')
        //TODO , implement ONCE instead of each
        this.subscribe(reps.PlatformTag).each((platformReplica)=>{
            console.log("Got replica")
        })
    }
}

server.spawnActor(Platform)
server.spawnActor(Customer)
server.spawnActor(Customer)