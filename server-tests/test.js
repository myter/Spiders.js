Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
class X {
    constructor() {
        this.someVal = 5;
    }
}
X["foo"] = new Map();
X["foo"].set("a", 1);
let x = new X();
let xx = utils_1.clone(x);
xx;
//# sourceMappingURL=test.js.map