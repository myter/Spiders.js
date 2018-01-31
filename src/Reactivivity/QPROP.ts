import {FarRef} from "../spiders";
import {PubSubTag} from "../PubSub/SubTag";
import {IsolateContainer, serialise} from "../serialisation";
import {Queue} from "./Queue";
import {DPropAlgorithm} from "./DPropAlgorithm";
import {SignalPool} from "./signalPool";
import {mutator, Signal, SignalFunction, SignalObject} from "./signal";
import {FarReference} from "../FarRef";

class SourceIsolate{
    sources

    constructor(sources){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.sources = sources
    }
}

export class PropagationValue{
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

export class DependencyChange{
    fromType    : PubSubTag
    toType      : PubSubTag

    constructor(fromType : PubSubTag,toType : PubSubTag){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.fromType   = fromType
        this.toType     = toType
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
    instabilitySet              : Array<PubSubTag>
    stampCounter                : number
    dynamic                     : boolean
    signalPool                  : SignalPool
    parentSignals               : Map<string,Signal>
    parentSignalResolver        : Function



    constructor(ownType,directParents,directChildren,hostActor,defaultVal,dependencyChangeType : PubSubTag,isDynamic){
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
        this.instabilitySet             = []
        this.stampCounter               = 0
        this.dynamic                    = isDynamic
        this.parentSignals              = new Map()
        //this.printInfo()
        hostActor.publish(this,ownType)
        hostActor.subscribe(dependencyChangeType).each((change : DependencyChange)=>{
            //console.log("Dependency addition detected")
            if(change.toType.tagVal == this.ownType.tagVal && !this.contains(this.directParents,change.fromType)){
                this.dynamicDependencyAddition(change)
            }
        })
        this.pickInit()
    }

    ////////////////////////////////////////
    // Helping function                 ///
    ///////////////////////////////////////

    printInfo(){
        console.log("Info for: " + this.ownType.tagVal)
        console.log("Direct Parents: " + this.directParents.length)
        this.directParents.forEach((parent : PubSubTag)=>{
            console.log(parent.tagVal)
        })
        console.log("Direct Children: " + this.directChildren.length)
        this.directChildren.forEach((child : PubSubTag)=>{
            console.log(child.tagVal)
        })
        console.log("Queue info:")
        this.inputQueues.forEach((qs,parent)=>{
            console.log("Queues for : " + parent)
            qs.forEach((q,source)=>{
                console.log("Source: " + source)
                console.log("Length: " + q.getLength())
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
                if(!this.contains(all,source)){
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

    contains(typeArray : Array<PubSubTag>,targettype : PubSubTag){
        return typeArray.filter((type : PubSubTag)=>{
            return type.tagVal == targettype.tagVal
        }).length > 0
    }

    ////////////////////////////////////////
    // Algorithm                        ///
    ///////////////////////////////////////

    pickInit(){
        this.directParents.forEach((parentType : PubSubTag)=>{
            this.inputQueues.set(parentType.tagVal,new Map())
        })
        if(this.dynamic){
            this.initDynamic()
        }
        else{
            this.initRegular()
        }
        //Spiders.js sometimes fails to deliver the isReferences message (not a QPROP issue) TODO need to check this
        /*let check = (ref)=>{
            ref.isReferenced(this.ownType).then((b)=>{
                if(b){
                    this.initRegular()
                }
                else{
                    //console.log("Init dynamic for: " + this.ownType.tagVal)
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
        }*/
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
                    //console.log("Node : " + this.ownType.tagVal + " is ready !")
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
        let updateParents = ()=>{
            this.directParentRefs.forEach((parentRef : FarRef)=>{
                parentRef.addChild(this)
            })
        }

        let updateChildren = ()=>{
            let childrenUpdated = 0
            this.directChildren.forEach((childType : PubSubTag)=>{
                this.host.subscribe(childType).each((childRef : FarRef)=>{
                    this.directChildrenRefs.push(childRef)
                    childRef.updateSources(this.ownType,this.getAllSources(),true,this.ownDefault).then(()=>{
                        childrenUpdated++
                        if(childrenUpdated == this.directChildren.length){
                            updateParents()
                        }
                    })
                })
            })
        }

        let queuesConstructed = 0
        this.directParents.forEach((parentType : PubSubTag)=>{
            this.host.subscribe(parentType).each((parentRef : FarRef)=>{
                this.directParentRefs.push(parentRef)
                parentRef.getDefaultValue().then((defVal)=>{
                    this.directParentDefaultVals.set(parentType.tagVal,defVal)
                })
                parentRef.getSourceMap().then((sourceMap : SourceIsolate)=>{
                    let theseSources = this.getAllSources().sources
                    sourceMap.sources.forEach((source : PubSubTag)=>{
                        let hasSource   = this.contains(theseSources,source)
                        let hasInstable = this.contains(this.instabilitySet,source)
                        if(hasSource && hasInstable){
                            this.instabilitySet.push(source)
                        }
                    })
                    this.constructQueue(parentType,sourceMap.sources)
                    queuesConstructed++
                    if(queuesConstructed == this.directParents.length){
                        updateChildren()
                    }
                })
            })
        })
        if(this.directParents.length == 0){
            updateChildren()
        }
    }

    dynamicDependencyAddition(change : DependencyChange){
        this.inputQueues.set(change.fromType.tagVal,new Map())
        this.directParents.push(change.fromType)
        this.host.subscribe(change.fromType).once((fromRef : FarRef)=>{
            this.directParentRefs.push(fromRef)
            fromRef.getDefaultValue().then((defVal)=>{
                this.directParentDefaultVals.set(change.fromType.tagVal,defVal)
            })
            fromRef.getSourceMap().then((sourceMap : SourceIsolate)=>{
                let theseSources = this.getAllSources().sources
                sourceMap.sources.forEach((source : PubSubTag)=>{
                    let hasSource   = this.contains(theseSources,source)
                    let hasInstable = this.contains(this.instabilitySet,source)
                    if(hasSource && hasInstable){
                        this.instabilitySet.push(source)
                    }
                })
                this.constructQueue(change.fromType,sourceMap.sources)
                let childrenUpdated = 0
                this.directChildrenRefs.forEach((childRef : FarRef)=>{
                    childRef.updateSources(this.ownType,this.getAllSources(),true,this.ownDefault).then(()=>{
                        childrenUpdated++
                        if(childrenUpdated == this.directChildren.length){
                            fromRef.addChild(this)
                        }
                    })
                })
                if(this.directChildren.length == 0){
                    fromRef.addChild(this)
                }
            })
        })
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
        if(this.contains(this.instabilitySet,messageOrigin)){
            return propagate && this.canStabilise(qs,messageOrigin)
        }
        else{
            return propagate
        }
    }

    canStabilise(qs : Array<Queue>,messageOrigin: PubSubTag){
        let commonStamps    : Array<number> = []
        let allStamps       : Array<number> = []
        let commonTimeStamp                 = false
        qs.forEach((outerQ : Queue)=>{
            outerQ.peekAll((v : PropagationValue)=>{
                let found = true
                allStamps.push(v.timeStamp)
                qs.forEach((innerQ : Queue)=>{
                    if(outerQ != innerQ){
                        found = found && (innerQ.contains((el)=>{return el.timeStamp == v.timeStamp}))
                    }
                })
                if(found && (!(commonStamps as any).includes(v.timeStamp))){
                    commonStamps.push(v.timeStamp)
                }
                commonTimeStamp = commonTimeStamp || found
            })
        })
        if(commonTimeStamp){
            let lowest = -1
            commonStamps.forEach((stamp : number)=>{
                if(stamp < lowest || lowest < 0){
                    lowest = stamp
                }
            })
            qs.forEach((q : Queue)=>{
                q.remove((val : PropagationValue)=>{
                    return val.timeStamp >= lowest
                })
            })
            this.instabilitySet = this.instabilitySet.filter((source : PubSubTag)=>{
                return source.tagVal != messageOrigin.tagVal
            })
        }
        return commonTimeStamp
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
        try{
            originQueue.enQueue(message)
        }
        catch(e){
            if(this.ownType.tagVal == "50"){
                console.log("UNABLE TO ENQUEUE FOR ORIGIN: " + message.origin.tagVal + " in " + this.ownType.tagVal + " from parent: " + from.tagVal)
            }
        }
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
        return (this.contains(this.directParents,someType)) || (this.contains(this.directChildren,someType))
    }


    addChild(childRef : FarRef){
        this.directChildrenRefs.push(childRef)
    }

    getDefaultValue(){
        return this.ownDefault
    }

    updateSources(from : PubSubTag,sourceMap : SourceIsolate,updateDef = false,defVal = null){
        if(from.tagVal != this.ownType.tagVal){
            let sources     = sourceMap.sources
            let mySources   = this.getAllSources().sources
            sources.forEach((source : PubSubTag)=>{
                if(this.contains(mySources,source) && (!this.contains(this.instabilitySet,source))){
                    this.instabilitySet.push(source)
                }
            })
            if(updateDef){
                this.inputQueues.set(from.tagVal,new Map())
                this.directParentDefaultVals.set(from.tagVal,defVal)
                this.directParents.push(from)
            }
            this.constructQueue(from,sources)
            if(this.directChildren.length == 0){
                return "ok"
            }
            else{
                let resReceived = 0
                return new Promise((resolve)=>{
                    this.directChildrenRefs.forEach((childRef : FarRef)=>{
                        childRef.updateSources(this.ownType,sourceMap).then(()=>{
                            resReceived++
                            if(resReceived == this.directChildren.length){
                                resolve("ok")
                            }
                        })
                    })
                })
            }
        }
    }

    getSourceMap(){
        return this.getAllSources()
    }

    getSignal(signal){
        //Dummy neeed to trigger underlying deserialisation of SpiderS.js
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
        if(this.startsReceived != this.directChildren.length || !this.dynamic){
            signal.holder.onChangeListener = () => {
                this.propagate(signal.holder,[])
            }
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
            if(this.directParents.length == 0){
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
        if(this.startsReceived == this.directChildren.length || this.dynamic){
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