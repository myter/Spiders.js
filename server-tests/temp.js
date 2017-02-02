/**
 * Created by flo on 25/01/2017.
 */
var spider = require('../src/spiders');
var app = new spider.Application();
class Actor1 extends spider.Actor {
    getArray(arr) {
        console.log(arr.length);
    }
}
class Actor2 extends spider.Actor {
    sendArray(ref) {
        ref.getArray(new this.ArrayIsolate([1, 2, 3, 4]));
    }
}
var a1 = app.spawnActor(Actor1);
var a2 = app.spawnActor(Actor2, [], 8082);
a2.sendArray(a1);
//# sourceMappingURL=temp.js.map