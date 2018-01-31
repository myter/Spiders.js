Object.defineProperty(exports, "__esModule", { value: true });
class X {
    constructor() {
        this.someVal = 5;
        Object.defineProperty(this, "someVal", {
            get: function () {
                return this.someVal;
            },
            set: function (x) {
                console.log("Trying with " + x);
                throw new Error("Cannot set");
            }
        });
    }
    foo() {
        this.someVal = 555;
    }
}
let x = new X();
//x.someVal = 6
x.foo();
console.log(x.someVal);
//# sourceMappingURL=test.js.map