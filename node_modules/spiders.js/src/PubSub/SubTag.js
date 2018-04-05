Object.defineProperty(exports, "__esModule", { value: true });
const serialisation_1 = require("../serialisation");
/**
 * Created by flo on 22/03/2017.
 */
var spiders = require("../spiders");
class PubSubTag {
    constructor(tagVal) {
        this[serialisation_1.SpiderIsolateContainer.checkIsolateFuncKey] = true;
        this.tagVal = tagVal;
    }
    equals(otherTag) {
        otherTag.tagVal == this.tagVal;
    }
    asString() {
        return this.tagVal;
    }
}
exports.PubSubTag = PubSubTag;
//# sourceMappingURL=SubTag.js.map