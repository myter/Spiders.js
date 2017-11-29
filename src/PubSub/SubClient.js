Object.defineProperty(exports, "__esModule", { value: true });
const serialisation_1 = require("../serialisation");
/**
 * Created by flo on 22/03/2017.
 */
class Subscription {
    constructor() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
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
class Publication {
    constructor() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
    }
    cancel() {
        //TODO, How can server identifiy which publiciation to withdraw ? Far ref equality will probably not work
    }
}
exports.Publication = Publication;
class PSClient {
    constructor(serverAddress = "127.0.0.1", serverPort = 8000, hostActor) {
        this.connected = false;
        this.serverAddress = serverAddress;
        this.serverPort = serverPort;
        var that = this;
        this.bufferedMessages = [];
        hostActor.remote(this.serverAddress, this.serverPort).then((serverRef) => {
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
                this.serverRef.addPublish(object, typeTag);
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
//# sourceMappingURL=SubClient.js.map