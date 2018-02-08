Object.defineProperty(exports, "__esModule", { value: true });
const spiders_js_1 = require("../spiders.js");
/**
 * Created by flo on 22/03/2017.
 */
class PubSubTag extends spiders_js_1.SpiderIsolate {
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