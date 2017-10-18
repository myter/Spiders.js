Object.defineProperty(exports, "__esModule", { value: true });
var spiderLib = require("../src/spiders");
let app = new spiderLib.Application();
class Actor1 extends spiderLib.Actor {
    tryIt(ref) {
        ref.test().then((v) => {
            console.log("Resolved with: " + v);
        });
    }
}
class Actor2 extends spiderLib.Actor {
    test() {
        /*return new Promise((resolve)=>{
            setTimeout(()=>{
                resolve("worked!")
            },3000)
        })*/
        return "also worked";
    }
}
function mergeAny(replicaOne, replicaTwo) {
    if (typeof replicaOne === 'number') {
        return Math.max(replicaOne, replicaTwo); // error
    }
}
//# sourceMappingURL=test.js.map