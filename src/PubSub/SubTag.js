Object.defineProperty(exports, "__esModule", { value: true });
const MOP_1 = require("../MOP");
/**
 * Created by flo on 22/03/2017.
 */
class PubSubTag extends MOP_1.SpiderIsolate {
    constructor(tagVal) {
        super();
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