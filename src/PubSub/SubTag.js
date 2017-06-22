Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 22/03/2017.
 */
var spiders = require("../spiders");
class PubSubTag extends spiders.Isolate {
    constructor(tagVal) {
        super();
        this.tagVal = tagVal;
    }
    equals(otherTag) {
        otherTag.tagVal == this.tagVal;
    }
}
exports.PubSubTag = PubSubTag;
//# sourceMappingURL=SubTag.js.map