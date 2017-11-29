import {FarRef, Isolate} from "../spiders";
import {PubSubTag} from "./SubTag";
import {IsolateContainer} from "../serialisation";
/**
 * Created by flo on 22/03/2017.
 */

export class Subscription{
    private subArray    : Array<any>
    private listeners   : Array<(any)=> any>
    private onceMode    : boolean
    private discovered  : number

    constructor(){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.subArray   = []
        this.listeners  = []
        this.onceMode   = false
        this.discovered = 0
    }

    newPublishedObject(publishedObject : Object){
        this.discovered++
        this.subArray.push(publishedObject)

        if(this.onceMode){
            if(!(this.discovered > 1)){
                this.listeners.forEach((callback)=>{
                    callback(publishedObject)
                })
            }
        }
        else{
            this.listeners.forEach((callback)=>{
                callback(publishedObject)
            })
        }
    }

    each(callback : (any)=> any){
        this.listeners.push(callback)
    }

    all() : Array<any>{
        return this.subArray
    }

    once(callback : (any)=> any){
        this.onceMode = true
        this.listeners.push(callback)
    }

    cancel(){
        //TODO
    }
}

export class Publication{

    constructor(){
        this[IsolateContainer.checkIsolateFuncKey] = true
    }

    cancel(){
        //TODO, How can server identifiy which publiciation to withdraw ? Far ref equality will probably not work
    }
}

export class PSClient{
    private connected           : boolean = false
    private serverAddress       : string
    private serverPort          : number
    private serverRef           : FarRef
    private bufferedMessages    : Array<Function>
    protected subscriptions     : Map<string,Array<Subscription>>

    constructor(serverAddress : string = "127.0.0.1",serverPort : number = 8000,hostActor){
        this.serverAddress  = serverAddress
        this.serverPort     = serverPort
        var that                = this
        this.bufferedMessages   = []
        hostActor.remote(this.serverAddress,this.serverPort).then((serverRef : FarRef)=>{
            console.log("Connected to PS Server")
            that.serverRef = serverRef
            that.connected = true
            if(that.bufferedMessages.length > 0){
                that.bufferedMessages.forEach((f)=>{
                    f.apply(that,[])
                })
            }
        })
        this.subscriptions      = new Map()
    }

    publish(object : Object,typeTag : PubSubTag){
        if(this.connected){
            this.serverRef.addPublish(object,typeTag)
        }
        else{
            this.bufferedMessages.push(()=>{
                this.serverRef.addPublish(object,typeTag)
            })
        }
        //TODO return publication object
    }

    subscribe(typeTag : PubSubTag) : Subscription{
        if(this.connected){
            this.serverRef.addSubscriber(typeTag,this)
        }
        else{
            this.bufferedMessages.push(()=>{
                this.serverRef.addSubscriber(typeTag,this)
            })
        }
        let sub = new Subscription()
        if(!this.subscriptions.has(typeTag.tagVal)){
            this.subscriptions.set(typeTag.tagVal,[])
        }
        this.subscriptions.get(typeTag.tagVal).push(sub)
        return sub
    }

    newPublished(publishedObject : any,typeTag : PubSubTag){
        //Sure to have at least one subscription, given that server only invokes this method if this actor is in the TypeTag's subscribers list
        this.subscriptions.get(typeTag.tagVal).forEach((sub : Subscription)=>{
            sub.newPublishedObject(publishedObject)
        })
    }
}