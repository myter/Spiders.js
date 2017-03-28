import {SpiderLib,FarRef} from "../spiders";
import {PubSubTag} from "./SubTag";
/**
 * Created by flo on 22/03/2017.
 */
var spiders : SpiderLib = require("../spiders")

export class Subscription extends spiders.Isolate{
    private subArray    : Array<any>
    private listeners   : Array<(any)=> any>

    constructor(){
        super()
        this.subArray   = []
        this.listeners  = []
    }

    newPublishedObject(publishedObject : Object){
        this.subArray.push(publishedObject)
        this.listeners.forEach((callback)=>{
            callback(publishedObject)
        })
    }

    each(callback : (any)=> any){
        this.listeners.push(callback)
    }

    all() : Array<any>{
        return this.subArray
    }

    cancel(){
        //TODO
    }
}

export class Publication extends spiders.Isolate{

    constructor(){
        super()
    }

    cancel(){
        //TODO, How can server identifiy which publiciation to withdraw ? Far ref equality will probably not work
    }
}

export class PubSubClient extends spiders.Actor{
    private Subscription
    private Publication
    private connected           : boolean = false
    private serverAddress       : string
    private serverPort          : number
    private serverRef           : FarRef
    private bufferedMessages    : Array<Function>
    private subscriptions       : Map<string,Array<Subscription>>

    constructor(serverAddress : string = "127.0.0.1",serverPort : number = 8000){
        super()
        this.serverAddress  = serverAddress
        this.serverPort     = serverPort
        this.Subscription   = Subscription
        this.Publication    = Publication
    }

    init(){
        var that                = this
        this.bufferedMessages   = []
        this.remote(this.serverAddress,this.serverPort).then((serverRef : FarRef)=>{
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
        let sub = new this.Subscription()
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