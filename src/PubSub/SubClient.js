Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../spiders");
const SubTag_1 = require("./SubTag");
/**
 * Created by flo on 22/03/2017.
 */
/*This might seem strange, and it is. Need to explicitly have the definition in the file scope in order to correctly bundle it.
Otherwise typescript will prepend the lib name which will mess up the bundling
*/
var PSTag = SubTag_1.PubSubTag;
class Subscription extends spiders_1.SpiderIsolate {
    constructor() {
        super();
        this.subArray = [];
        this.listeners = [];
        this.onceMode = false;
        this.discovered = 0;
    }
    newPublishedObject(publishedObject) {
        this.discovered++;
        this.subArray.push(publishedObject);
        if (this.onceMode) {
            if (!(this.discovered > 1)) {
                this.listeners.forEach((callback) => {
                    callback(publishedObject);
                });
            }
        }
        else {
            this.listeners.forEach((callback) => {
                callback(publishedObject);
            });
        }
    }
    each(callback) {
        this.listeners.push(callback);
    }
    all() {
        return this.subArray;
    }
    once(callback) {
        this.onceMode = true;
        this.listeners.push(callback);
    }
    cancel() {
        //TODO
    }
}
exports.Subscription = Subscription;
class Publication extends spiders_1.SpiderIsolate {
    cancel() {
        //TODO, How can server identifiy which publiciation to withdraw ? Far ref equality will probably not work
    }
}
exports.Publication = Publication;
class PSClient extends spiders_1.ActorTrait {
    constructor(myActor, serverAddress, serverPort) {
        super(myActor);
        this.connected = false;
        myActor.PubSubTag = PSTag;
        var that = this;
        this.bufferedMessages = [];
        myActor.remote(serverAddress, serverPort).then((serverRef) => {
            that.serverRef = serverRef;
            that.connected = true;
            if (that.bufferedMessages.length > 0) {
                that.bufferedMessages.forEach((f) => {
                    f.apply(that, []);
                });
            }
        });
        this.subscriptions = new Map();
    }
    publish(object, typeTag) {
        if (this.connected) {
            this.serverRef.addPublish(object, typeTag);
        }
        else {
            this.bufferedMessages.push(() => {
                console.log("Publishing");
                for (var i in this) {
                    console.log(i);
                }
                this.serverRef.addPublish(object, typeTag);
                console.log("Published");
            });
        }
        //TODO return publication object
    }
    subscribe(typeTag) {
        if (this.connected) {
            this.serverRef.addSubscriber(typeTag, this);
        }
        else {
            this.bufferedMessages.push(() => {
                this.serverRef.addSubscriber(typeTag, this);
            });
        }
        let sub = new Subscription();
        if (!this.subscriptions.has(typeTag.tagVal)) {
            this.subscriptions.set(typeTag.tagVal, []);
        }
        this.subscriptions.get(typeTag.tagVal).push(sub);
        return sub;
    }
    newPublished(publishedObject, typeTag) {
        //Sure to have at least one subscription, given that server only invokes this method if this actor is in the TypeTag's subscribers list
        this.subscriptions.get(typeTag.tagVal).forEach((sub) => {
            sub.newPublishedObject(publishedObject);
        });
    }
}
exports.PSClient = PSClient;
let scope = new spiders_1.LexScope();
scope.addElement("Subscription", Subscription);
scope.addElement("Publication", Publication);
scope.addElement("PSTag", PSTag);
spiders_1.bundleScope(PSClient, scope);
//# sourceMappingURL=SubClient.js.map