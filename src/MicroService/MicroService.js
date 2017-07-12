Object.defineProperty(exports, "__esModule", { value: true });
const SubClient_1 = require("../PubSub/SubClient");
/**
 * Created by flo on 30/06/2017.
 */
var ps = require("../PubSub/PubSub");
class MicroService extends SubClient_1.PubSubClient {
    newTopic(topicName) {
        return new ps.PubSubTag(topicName);
    }
    publishStrong(signalVal, typeTag) {
        if (signalVal.holder.strong) {
            return this.publish(signalVal, typeTag);
        }
        else {
            throw new Error("Cannot publish weak signal as strong for tag: " + typeTag.tagVal);
        }
    }
    publishWeak(signalVal, typeTag) {
        //No need to check strong/weakness here signal is either weak and then it's ok, or strong in which case it will be converted to weak signal at receiving side
        signalVal.holder.makeTempWeak();
        return this.publish(signalVal, typeTag);
    }
    subscribeStrong(typeTag) {
        let ret = new this.Subscription();
        this.subscribe(typeTag).each((sigVal) => {
            if (sigVal.holder.strong) {
                ret.newPublishedObject(sigVal);
            }
            else {
                throw new Error("Cannot strongly subscribe to weak signal for tag: " + typeTag.tagVal);
            }
        });
        return ret;
    }
    subscribeWeak(typeTag) {
        let ret = new this.Subscription();
        this.subscribe(typeTag).each((sigVal) => {
            sigVal.holder.makeWeak();
            ret.newPublishedObject(sigVal);
        });
        return ret;
    }
}
exports.MicroService = MicroService;
//# sourceMappingURL=MicroService.js.map