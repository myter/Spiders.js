Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 30/06/2017.
 */
var spiders = require("../spiders");
class MicroService extends spiders.Actor {
    init() {
        this.PSClient();
    }
    newTopic(topicName) {
        return this.newPSTag(topicName);
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
        let ret = this.subscribe(typeTag);
        ret.each((sigVal) => {
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
        let ret = this.subscribe(typeTag);
        ret.each((sigVal) => {
            sigVal.holder.makeWeak();
            ret.newPublishedObject(sigVal);
        });
        return ret;
    }
    //USED FOR QPROP
    setupInfo(graphInfo) {
        this.start(this.QPROP(graphInfo.ownType, graphInfo.directParents, graphInfo.directChildren, graphInfo.initialValue));
    }
}
exports.MicroService = MicroService;
//TODO need to refactor this
class MicroServiceApp extends spiders.Application {
    constructor(ownAddress = "127.0.0.1", ownPort = 8001, serverAddress = "127.0.0.1", serverPort = 8000) {
        super(ownAddress, ownPort);
        this.PSClient(serverAddress, serverPort);
    }
    newTopic(topicName) {
        return this.newPSTag(topicName);
    }
    in(...typeTags) {
    }
    out(typeTag, signal) {
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
        let ret = this.subscribe(typeTag);
        ret.each((sigVal) => {
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
        let ret = this.subscribe(typeTag);
        ret.each((sigVal) => {
            sigVal.holder.makeWeak();
            ret.newPublishedObject(sigVal);
        });
        return ret;
    }
}
exports.MicroServiceApp = MicroServiceApp;
//# sourceMappingURL=MicroService.js.map