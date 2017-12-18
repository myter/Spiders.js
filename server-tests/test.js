Object.defineProperty(exports, "__esModule", { value: true });
const MOP_1 = require("../src/MOP/MOP");
class SubObject extends MOP_1.SpiderObject {
    constructor() {
        super(...arguments);
        this.someSuperField = 5;
    }
    someFoo() {
        return 5;
    }
}
class SubSubObject extends SubObject {
    constructor() {
        super();
        this.someSubField = 10;
    }
    someOtherFoo() {
        return super.someFoo() + 10;
    }
}
var o = new SubSubObject();
console.log(o.someOtherFoo());
console.log(o.someSuperField);
console.log(o.someSubField);
//# sourceMappingURL=test.js.map