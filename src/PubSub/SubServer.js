Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 22/03/2017.
 */
var spiders = require('../spiders');
class PSServer {
    constructor(address = "127.0.0.1", port = 8000) {
        this.subscribers = new Map();
        this.published = new Map();
    }
    addPublish(published, typeTag) {
        if (!this.published.has(typeTag.tagVal)) {
            this.published.set(typeTag.tagVal, []);
        }
        this.published.get(typeTag.tagVal).push(published);
        if (this.subscribers.has(typeTag.tagVal)) {
            this.subscribers.get(typeTag.tagVal).forEach((subscriber) => {
                subscriber.newPublished(published, typeTag);
            });
        }
    }
    addSubscriber(typeTag, subReference) {
        if (!this.subscribers.has(typeTag.tagVal)) {
            this.subscribers.set(typeTag.tagVal, []);
        }
        this.subscribers.get(typeTag.tagVal).push(subReference);
        if (this.published.has(typeTag.tagVal)) {
            this.published.get(typeTag.tagVal).forEach((publishedObject) => {
                subReference.newPublished(publishedObject, typeTag);
            });
        }
    }
}
exports.PSServer = PSServer;
/*export class PubSubServer extends spiders.Application{
    private subscribers : Map<string,Array<FarRef>>
    private published   : Map<string,Array<any>>

    constructor(address : string = "127.0.0.1",port : number = 8000){
        super(address,port)
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
}*/ 
//# sourceMappingURL=SubServer.js.map