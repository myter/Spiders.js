import {PubSubClient} from "../PubSub/SubClient";
import {PubSubLib} from "../PubSub/PubSub";
import {Signal, SignalValue} from "../Reactivivity/signal";
import {PubSubTag} from "../PubSub/SubTag";
/**
 * Created by flo on 30/06/2017.
 */
var ps      : PubSubLib = require("../PubSub/PubSub")
export abstract class MicroService extends PubSubClient{

    newTopic(topicName : string){
        return new ps.PubSubTag(topicName)
    }

    publishStrong(signalVal : SignalValue,typeTag : PubSubTag){
        if(signalVal.holder.strong){
            return this.publish(signalVal,typeTag)
        }
        else{
            throw new Error("Cannot publish weak signal as strong for tag: " + typeTag.tagVal)
        }
    }

    publishWeak(signalVal : SignalValue,typeTag : PubSubTag){
        //No need to check strong/weakness here signal is either weak and then it's ok, or strong in which case it will be converted to weak signal at receiving side
        signalVal.holder.makeTempWeak()
        return this.publish(signalVal,typeTag)
    }

    subscribeStrong(typeTag : PubSubTag){
        let ret = new this.Subscription()
        this.subscribe(typeTag).each((sigVal : SignalValue)=>{
            if(sigVal.holder.strong){
                ret.newPublishedObject(sigVal)
            }
            else{
                throw new Error("Cannot strongly subscribe to weak signal for tag: " + typeTag.tagVal)
            }
        })
        return ret
    }

    subscribeWeak(typeTag : PubSubTag){
        let ret = new this.Subscription()
        this.subscribe(typeTag).each((sigVal : SignalValue)=>{
            sigVal.holder.makeWeak()
            ret.newPublishedObject(sigVal)
        })
        return ret
    }
}