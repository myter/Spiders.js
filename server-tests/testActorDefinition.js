Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
/**
 * Created by flo on 30/06/2017.
 */
class TestActor extends spiders_1.Actor {
    constructor(someval) {
        super();
        console.log(someval);
    }
    getValue() {
        return 5;
    }
}
exports.TestActor = TestActor;
//# sourceMappingURL=testActorDefinition.js.map