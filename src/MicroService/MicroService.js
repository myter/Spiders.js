Object.defineProperty(exports, "__esModule", { value: true });
const SubClient_1 = require("../PubSub/SubClient");
/**
 * Created by flo on 30/06/2017.
 */
var ps = require("../PubSub/PubSub");
class MicroService extends SubClient_1.PubSubClient {
    //TODO
    newTopic(topicName) {
        return new ps.PubSubTag(topicName);
    }
}
exports.MicroService = MicroService;
//# sourceMappingURL=MicroService.js.map