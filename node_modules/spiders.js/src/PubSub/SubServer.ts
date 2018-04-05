import {SpiderLib, FarRef} from "../spiders";
import {PubSubTag} from "./SubTag";
/**
 * Created by flo on 22/03/2017.
 */
var spiders : SpiderLib = require('../spiders')

export class PSServer{
    private subscribers : Map<string,Array<FarRef>>
    private published   : Map<string,Array<any>>

    constructor(address : string = "127.0.0.1",port : number = 8000){
        this.subscribers    = new Map()
        this.published      = new Map()
    }

    addPublish(published,typeTag : PubSubTag){
        if(!this.published.has(typeTag.tagVal)){
            this.published.set(typeTag.tagVal,[])
        }
        this.published.get(typeTag.tagVal).push(published)
        if(this.subscribers.has(typeTag.tagVal)){
            this.subscribers.get(typeTag.tagVal).forEach((subscriber : FarRef)=>{
                subscriber.newPublished(published,typeTag)
            })
        }
    }

    addSubscriber(typeTag : PubSubTag,subReference : FarRef){
        if(!this.subscribers.has(typeTag.tagVal)){
            this.subscribers.set(typeTag.tagVal,[])
        }
        this.subscribers.get(typeTag.tagVal).push(subReference)
        if(this.published.has(typeTag.tagVal)){
            this.published.get(typeTag.tagVal).forEach((publishedObject)=>{
                subReference.newPublished(publishedObject,typeTag)
            })
        }
    }
}