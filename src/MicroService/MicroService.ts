import {SpiderLib} from "../spiders";
import {PubSubClient} from "../PubSub/SubClient";
import {PubSubLib} from "../PubSub/PubSub";
/**
 * Created by flo on 30/06/2017.
 */
var ps      : PubSubLib = require("../PubSub/PubSub")
export abstract class MicroService extends PubSubClient{
    //TODO

    newTopic(topicName : string){
        return new ps.PubSubTag(topicName)
    }
}