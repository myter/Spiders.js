import {SignalValue} from "../Reactivivity/signal";
import {PubSubTag} from "../PubSub/SubTag";
import {SpiderLib} from "../spiders";
import {GraphInfo} from "./ServiceMonitor";
/**
 * Created by flo on 30/06/2017.
 */
var spiders : SpiderLib = require("../spiders")
export abstract class MicroService extends spiders.Actor{

    init(){
        this.PSClient()
    }

    newTopic(topicName : string){
        return this.newPSTag(topicName)
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
        let ret = this.subscribe(typeTag)
        ret.each((sigVal : SignalValue)=>{
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
        let ret = this.subscribe(typeTag)
        ret.each((sigVal : SignalValue)=>{
            sigVal.holder.makeWeak()
            ret.newPublishedObject(sigVal)
        })
        return ret
    }

    //USED FOR QPROP
    setupInfo(graphInfo : GraphInfo){
        (this as any).start(this.QPROP(graphInfo.ownType,graphInfo.directParents,graphInfo.directChildren,graphInfo.initialValue))
    }
}

//TODO need to refactor this
export abstract class MicroServiceApp extends spiders.Application{

    constructor(ownAddress = "127.0.0.1",ownPort = 8001,serverAddress = "127.0.0.1",serverPort = 8000){
        super(ownAddress,ownPort)
        this.PSClient(serverAddress,serverPort)
    }

    newTopic(topicName : string){
        return this.newPSTag(topicName)
    }

    in(... typeTags){

    }

    out(typeTag : PubSubTag,signal){

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
        let ret = this.subscribe(typeTag)
        ret.each((sigVal : SignalValue)=>{
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
        let ret = this.subscribe(typeTag)
        ret.each((sigVal : SignalValue)=>{
            sigVal.holder.makeWeak()
            ret.newPublishedObject(sigVal)
        })
        return ret
    }
}