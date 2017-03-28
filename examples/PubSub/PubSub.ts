import {SpiderLib} from "../../src/spiders";
import {PubSubLib} from "../../src/PubSub/PubSub";
/**
 * Created by flo on 22/03/2017.
 */
var spiders : SpiderLib = require("../../src/spiders")
var ps      : PubSubLib = require("../../src/PubSub/PubSub")

//Default server serves as centralised discovery and blackboard service
var server = new ps.PubSubServer()


class ExamplePeer extends ps.PubSubClient{
    isolateTag
    farTag
    constructor(){
        super()
        this.isolateTag = new ps.PubSubTag("isolate")
        this.farTag     = new ps.PubSubTag("far")
    }
}

class ExampleIsolate extends spiders.Isolate{
    msg
    constructor(){
        super()
        this.msg = "Hello Isolate"
    }
}

class ExamplePublishPeer extends ExamplePeer{
    ExampleIsolate
    dir

    constructor(){
        super()
        this.ExampleIsolate = ExampleIsolate
    }

    init(){
        this.publish(new this.ExampleIsolate(),this.isolateTag)
        let farOb = {
            print : function(){
                console.log("Print invoked on far object")
            }
        }
        this.publish(farOb,this.farTag)
    }
}

class ExampleSubscribePeer extends ExamplePeer{
    init(){
        this.subscribe(this.isolateTag).each((isol)=>{
            console.log("Discovered isolate, msg : " + isol.msg)
        })
        this.subscribe(this.farTag).each((farRef)=>{
            console.log("Discovered far object")
            farRef.print()
        })
    }
}

let pub = server.spawnActor(ExamplePublishPeer)
let sub = server.spawnActor(ExampleSubscribePeer)