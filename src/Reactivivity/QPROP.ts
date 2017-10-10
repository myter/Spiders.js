import {FarRef} from "../spiders";
import {PubSubTag} from "../PubSub/SubTag";
import {IsolateContainer} from "../serialisation";
import {Queue} from "./Queue";

class SourceIsolate{
    sources

    constructor(sources){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.sources = sources
    }

    getSources(){
        return this.sources
    }
}

export class QPROPNode{
    host
    ownType                     : PubSubTag
    ownDefault
    directParents               : Array<PubSubTag>
    directChildren              : Array<PubSubTag>
    directParentRefs            : Array<FarRef>
    directChildrenRefs          : Array<FarRef>
    directParentLastKnownVals   : Map<PubSubTag,any>
    directParentDefaultVals     : Map<PubSubTag,any>
    sourceMap                   : Map<PubSubTag,Array<PubSubTag>>
    propagationPaths
    //For each parent, keep a map of source -> queue
    inputQueues                 : Map<PubSubTag,Map<PubSubTag,Queue>>
    parentsReceived             : number
    startsReceived              : number
    readyListeners              : Array<Function>
    instabilitySet              : Set<any>
    stampCounter                : number
    dynamic                     : boolean



    constructor(ownType,directParents,directChildren,hostActor,defaultVal){
        this.host                       = hostActor
        this.ownType                    = ownType
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
        this.pickInit()
    }

    ////////////////////////////////////////
    // Helping function                 ///
    ///////////////////////////////////////

    receivedAllParents(){
        return this.parentsReceived == this.directParents.length
    }

    sendReady(){
        if((this.startsReceived == this.directChildrenRefs.length) && (this.directParentRefs.length == this.directParents.length) && (this.directChildrenRefs.length != 0)){
            this.directParentRefs.forEach((parentRef : FarRef)=>{
                parentRef.receiveStart()
                //TODO trigger ready listeners
                console.log("Node : " + this.ownType.tagVal + " is ready !")
            })
        }
    }

    sendParents(){
        if(this.receivedAllParents() && (this.directChildrenRefs.length == this.directChildren.length)){
            this.directChildrenRefs.forEach((childRef : FarRef)=>{
                childRef.receiveParents(this.ownType,this.getAllSources(),this.ownDefault)
            })
            if(this.directChildrenRefs.length == 0 && (this.directParentRefs.length == this.directParents.length)){
                this.directParentRefs.forEach((parentRef : FarRef)=>{
                    parentRef.receiveStart()
                })
            }
        }
    }

    getAllSources(){
        let all : any = []
        this.sourceMap.forEach((sources : Array<PubSubTag>)=>{
            sources.forEach((source : PubSubTag)=>{
                if(!all.includes(source)){
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
        this.sourceMap.set(from,sources)
        let allQs = this.inputQueues.get(from)
        sources.forEach((source : PubSubTag)=>{
            allQs.set(source,new Queue())
        })
    }

    ////////////////////////////////////////
    // Algorithm                        ///
    ///////////////////////////////////////

    pickInit(){
        //TODO add dynamic behaviour
        this.directParents.forEach((parentType : PubSubTag)=>{
            this.inputQueues.set(parentType,new Map())
        })
        this.initRegular()
    }

    initRegular(){
        this.directParents.forEach((parenType : PubSubTag)=>{
            this.host.subscribe(parenType).each((parentRef : FarRef)=>{
                this.directParentRefs.push(parentRef)
                this.sendReady()
                if(this.receivedAllParents() && this.directChildren.length == 0){
                    this.directParentRefs.forEach((parentRef : FarRef)=>{
                        parentRef.receiveStart()
                    })
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


    ////////////////////////////////////////
    // Calls made by other QPROP nodes  ///
    ///////////////////////////////////////

    receiveStart(){
        this.startsReceived++
        this.sendReady()
    }

    receiveParents(from : PubSubTag,sources : SourceIsolate,defaultValue){
        this.parentsReceived++
        this.directParentDefaultVals.set(from,defaultValue)
        this.constructQueue(from,sources.getSources())
        this.sendParents()
    }

}