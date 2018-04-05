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
//# sourceMappingURL=SubServer.js.map