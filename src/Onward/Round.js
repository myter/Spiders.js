Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 09/03/2017.
 */
var spiders = require("../spiders");
class Round extends spiders.SpiderIsolate {
    constructor(objectId, masterOwnerId, roundNumber, methodName, args) {
        super();
        this.objectId = objectId;
        this.masterOwnerId = masterOwnerId;
        this.roundNumber = roundNumber;
        this.methodName = methodName;
        this.args = args;
    }
}
exports.Round = Round;
//# sourceMappingURL=Round.js.map