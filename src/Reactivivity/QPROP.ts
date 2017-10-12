import {FarRef} from "../spiders";
import {PubSubTag} from "../PubSub/SubTag";
import {IsolateContainer, serialise} from "../serialisation";
import {Queue} from "./Queue";
import {DPropAlgorithm} from "./DPropAlgorithm";
import {SignalPool} from "./signalPool";
import {mutator, Signal, SignalFunction, SignalObject} from "./signal";

class SourceIsolate{
    sources

    constructor(sources){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.sources = sources
    }
}

class PropagationValue{
    origin      : PubSubTag
    value       : any
    timeStamp   : number

    constructor(origin,value,timeStamp){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.origin     = origin
        this.value      = value
        this.timeStamp  = timeStamp
    }

    asString(){
        for(var i in this){
            if(i == "origin"){
                console.log(i)
                console.log("Value check1: " + this[i])
            }
        }
        console.log("Value check2: "  + this["origin"])
        return (this.origin.asString()) + " , " + this.value + " , " + this.timeStamp
    }
}

export class QPROPSourceSignal extends SignalObject{
    parentVals

    @mutator
    change(parentVals){
        this.parentVals = parentVals
    }
}

export class QPROPNode implements DPropAlgorithm{

    host
    ownType                     : PubSubTag
    ownSignal                   : QPROPSourceSignal
    ownDefault
    directParents               : Array<PubSubTag>
    directChildren              : Array<PubSubTag>
    directParentRefs            : Array<FarRef>
    directChildrenRefs          : Array<FarRef>
    directParentLastKnownVals   : Map<string,any>
    directParentDefaultVals     : Map<string,any>
    sourceMap                   : Map<string,Array<PubSubTag>>
    propagationPaths
    //For each parent, keep a map of source -> queue
    inputQueues                 : Map<string,Map<string,Queue>>
    parentsReceived             : number
    startsReceived              : number
    readyListeners              : Array<Function>
    instabilitySet              : Set<any>
    stampCounter                : number
    dynamic                     : boolean
    signalPool                  : SignalPool



    constructor(ownType,directParents,directChildren,hostActor,defaultVal){
        this.host                       = hostActor
        this.ownType                    = ownType
        this.ownSignal                  = new QPROPSourceSignal()
        this.ownDefault                 = defaultVal
        this.directChildren             = directChildren
        this.directParents              = directParents
        this.directChildrenRefs         = []
        this.directParentRefs           = []
        this.directParentLastKnownVals  = new Map()
        this.directParentDefaultVals    = new Map()
        this.sourceMap                  = new Map()
        this.propagationPaths           = new Map()
        this.inputQueues                = new Map()
        this.parentsReceived            = 0
        this.startsReceived             = 0
        this.readyListeners             = []
        this.instabilitySet             = new Set()
        this.stampCounter               = 0
        this.dynamic                    = false
        hostActor.publish(this,ownType)
        this.pickInit()
    }

    ////////////////////////////////////////
    // Helping function                 ///
    ///////////////////////////////////////

    printInfo(){
        console.log("Info for: " + this.ownType.tagVal)
        /*console.log("Direct Parents: " + this.directParents.length)
        this.directParents.forEach((parent : PubSubTag)=>{
            console.log(parent.tagVal)
        })
        console.log("Direct Children: " + this.directChildren.length)
        this.directChildren.forEach((child : PubSubTag)=>{
            console.log(child.tagVal)
        })*/
        console.log("Queue info:")
        this.inputQueues.forEach((qs,parent)=>{
            console.log("Queues for : " + parent)
            qs.forEach((_,source)=>{
                console.log("Source: " + source)
            })
        })
    }

    receivedAllParents(){
        return (this.parentsReceived == this.directParents.length) && (this.directParentRefs.length == this.directParents.length)
    }

    sendReady(){
        if((this.startsReceived == this.directChildren.length) && (this.directParentRefs.length == this.directParents.length) && (this.directChildren.length != 0)){
            this.directParentRefs.forEach((parentRef : FarRef)=>{
                parentRef.receiveStart(this.ownType)
            })
            this.readyListeners.forEach((readyListener : Function)=>{
                readyListener()
            })
            console.log("Node : " + this.ownType.tagVal + " is ready !")
        }
    }

    sendParents(){
        if(this.receivedAllParents() && (this.directChildrenRefs.length == this.directChildren.length)){
            this.directChildrenRefs.forEach((childRef : FarRef)=>{
                childRef.receiveParents(this.ownType,this.getAllSources(),this.ownDefault)
            })
            if(this.directChildrenRefs.length == 0 && (this.directParentRefs.length == this.directParents.length)){
                this.directParentRefs.forEach((parentRef : FarRef)=>{
                    parentRef.receiveStart(this.ownType)
                })
                console.log("Node : " + this.ownType.tagVal + " is ready !")
            }
        }
    }

    getAllSources(){
        let all : any = []
        this.sourceMap.forEach((sources : Array<PubSubTag>)=>{
            sources.forEach((source : PubSubTag)=>{
                let filtered = all.filter((s)=>{
                    return source.tagVal == source.tagVal
                })
                if(filtered.length == 0){
                    all.push(source)
                }
            })
        })
        if(this.directParents.length == 0){
            all.push(this.ownType)
        }
        return new SourceIsolate(all)
    }

    constructQueue(from : PubSubTag,sources : Array<PubSubTag>){
        this.sourceMap.set(from.tagVal,sources)
        let allQs = this.inputQueues.get(from.tagVal)
        sources.forEach((source : PubSubTag)=>{
            allQs.set(source.tagVal,new Queue())
        })
    }

    ////////////////////////////////////////
    // Algorithm                        ///
    ///////////////////////////////////////

    pickInit(){
        this.directParents.forEach((parentType : PubSubTag)=>{
            this.inputQueues.set(parentType.tagVal,new Map())
        })
        let check = (ref)=>{
            ref.isReferenced(this.ownType).then((b)=>{
                if(b){
                    this.initRegular()
                }
                else{
                    console.log("Init dynamic for: " + this.ownType.tagVal)
                    this.initDynamic()
                    this.dynamic = true
                }
            })
        }
        if(this.directParents.length == 0){
            this.host.subscribe(this.directChildren[0]).once((childRef  : FarRef)=>{
                check(childRef)
            })
        }
        else{
            this.host.subscribe(this.directParents[0]).once((parentRef : FarRef)=>{
                check(parentRef)
            })
        }
    }

    initRegular(){
        this.directParents.forEach((parenType : PubSubTag)=>{
            this.host.subscribe(parenType).each((parentRef : FarRef)=>{
                this.directParentRefs.push(parentRef)
                this.sendReady()
                if(this.receivedAllParents() && this.directChildren.length == 0){
                    this.directParentRefs.forEach((parentRef : FarRef)=>{
                        parentRef.receiveStart(this.ownType)
                    })
                    console.log("Node : " + this.ownType.tagVal + " is ready !")
                }
            })
        })

        this.directChildren.forEach((childType : PubSubTag)=>{
            this.host.subscribe(childType).each((childRef : FarRef)=>{
                this.directChildrenRefs.push(childRef)
                if((this.directChildrenRefs.length == this.directChildren.length) && this.directParents.length == 0){
                    this.directChildrenRefs.forEach((childRef : FarRef)=>{
                        childRef.receiveParents(this.ownType,this.getAllSources(),this.ownDefault)
                    })
                }
                else{
                    this.sendParents()
                }
            })
        })
    }

    initDynamic(){

    }

    canPropagate(messageOrigin : PubSubTag){
        let propagate   = true
        let qs          = []
        this.inputQueues.forEach((qSet : Map<string,Queue>,parentType : string)=>{
            if(qSet.has(messageOrigin.tagVal)){
                let q = qSet.get(messageOrigin.tagVal)
                qs.push(q)
                if(q.isEmpty()){
                    propagate = false
                }
            }
        })
        return propagate
    }

    getArgumentPosition(parentType : string){
        let index = -1
        this.directParents.forEach((parent,i)=>{
            if(parent.tagVal == parentType){
                index = i
            }
        })
        if(index < 0){
            throw new Error("Trying to fetch argument position of unknown parent type: " + parentType + " parents: " + this.directParents)
        }
        else{
            return index
        }
    }

    getPropagationArguments(messageOrigin : PubSubTag){
        let args = new Array(this.directParents.length)
        this.inputQueues.forEach((qSet : Map<string,Queue>,parentType : string)=>{
            if(qSet.has(messageOrigin.tagVal)){
                let q = qSet.get(messageOrigin.tagVal)
                args[this.getArgumentPosition(parentType)]     = q.deQueue().value
            }
            else{
                if(this.directParentLastKnownVals.has(parentType)){
                    args[this.getArgumentPosition(parentType)] = this.directParentLastKnownVals.get(parentType)
                }
                else{
                    args[this.getArgumentPosition(parentType)] = this.directParentDefaultVals.get(parentType)
                }
            }
        })
        return args
    }


    ////////////////////////////////////////
    // Calls made by other QPROP nodes  ///
    ///////////////////////////////////////

    receiveStart(from){
        this.startsReceived++
        this.sendReady()
    }

    receiveParents(from : PubSubTag,sources : SourceIsolate,defaultValue){
        this.parentsReceived++
        this.directParentDefaultVals.set(from.tagVal,defaultValue)
        this.constructQueue(from,sources.sources)
        this.sendParents()
    }

    receiveMessage(from : PubSubTag,message : PropagationValue){
        let qSet            = this.inputQueues.get(from.tagVal)
        let originQueue     = qSet.get(message.origin.tagVal)
        originQueue.enQueue(message)
        this.directParentLastKnownVals.set(from.tagVal,message.value)
        let canPropagate    = this.canPropagate(message.origin)
        if(canPropagate){
            let args = this.getPropagationArguments(message.origin)
            //This will start propagation of local change. The exported signal will invoke the propagate method (which will send
            this.signalPool.setLastPropMessage(message)
            this.ownSignal.change(args)

            //THIS IS DIFFERENT FROM AT VERSION
            /*this.directChildrenRefs.forEach((childRef : FarRef)=>{
                childRef.receiveMessage(this.ownType,new PropagationValue(message.origin,this.ownSignal.v,message.timeStamp))
            })*/
        }
    }

    isReferenced(someType : PubSubTag){
        let parentsFilter   = this.directParents.filter((parenType : PubSubTag)=>{
            return parenType.tagVal == someType.tagVal
        })
        let childrenFilter  = this.directChildren.filter((childType : PubSubTag)=>{
            return childType.tagVal == someType.tagVal
        })
        return (parentsFilter.length > 0) || (childrenFilter.length > 0)
    }

    getSignal(signal){
        //Dummy method which is only used to install a dependency between services
    }

    ////////////////////////////////////////
    // Calls made by Spiders.js          ///
    ///////////////////////////////////////

    setSignalPool(signalPool : SignalPool){
        this.signalPool = signalPool
    }

    publishSignal(signal){
        let publish = () => {
            this.directChildrenRefs.forEach((childRef : FarRef)=>{
                childRef.getSignal(signal)
            })
        }
        if(this.directChildrenRefs.length == this.directChildren.length){
            publish()
        }
        else{
            this.readyListeners.push(publish)
        }
    }

    //Called by spiders.js when exported signal must propagate
    propagate(signal: Signal, toIds: Array<string>) {
        var that = this
        let newVal = signal.value
        if(newVal instanceof SignalFunction){
            newVal = newVal.lastVal
        }
        let sendToAll = ()=>{
            if(signal.isSource){
                this.directChildrenRefs.forEach((childRef : FarRef)=>{
                    childRef.receiveMessage(that.ownType,new PropagationValue(that.ownType,newVal,that.stampCounter))
                })
                this.stampCounter++
            }
            else{
                //Get the message which originally triggered the local propagation
                let propMessage = this.signalPool.lastPropMessage
                this.directChildrenRefs.forEach((childRef : FarRef)=>{
                    childRef.receiveMessage(this.ownType,new PropagationValue(propMessage.origin,newVal,propMessage.timeStamp))
                })
            }
        }
        if(this.startsReceived == this.directChildren.length){
           sendToAll()
        }
        else{
           this.readyListeners.push(sendToAll)
        }
    }

    //No need to implement this, QPROP overrides this behaviour
    propagationReceived(fromId: string, signalId: string, value: any) {
        //Not needed
    }

}