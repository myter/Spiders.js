import {SpiderLib} from "../../src/spiders";
import {PubSubLib} from "../../src/PubSub/PubSub";
/**
 * Created by flo on 04/04/2017.
 */
var spiders : SpiderLib = require("../../src/spiders")
var pubsub  : PubSubLib = require("../../src/PubSub/PubSub")

export var PlatformTag = new pubsub.PubSubTag("Platform")
export var CustomerTag = new pubsub.PubSubTag("Customer")

class StrongField extends spiders.RepliqPrimitiveField{
    read(){
        return this.commited
    }
}
var Strong = spiders.makeAnnotation(StrongField)

class ImmutableField extends spiders.RepliqPrimitiveField{
    update(updates){
        throw new Error("Mutation of immutable fields dissalowed")
    }
}
var Immutable = spiders.makeAnnotation(ImmutableField)

export class PlatformRepliq extends spiders.Repliq{
    @spiders.Count
    customerCount

    cars

    @Strong
    availableCars

    constructor(){
        super()
        this.customerCount  = 0
        this.cars           = {}
        this.availableCars  = 10
    }

}

export class CustomerRepliq extends spiders.Repliq{
    @Immutable
    id
}