/**
 * Created by flo on 25/01/2017.
 */
var spider = require('../src/spiders');
//class testApp extends spider.Application{}
var app = new spider.Application();
class mIsolate extends spider.Isolate {
    perform() {
        var x = 6;
        return 6 + x;
    }
}
class testActor extends spider.Actor {
    constructor() {
        super();
        this.isol = mIsolate;
    }
    calc() {
        var x = 6;
        return 5 + x;
    }
    getNewIsol() {
        return new this.isol();
    }
}
var actor = app.spawnActor(testActor);
actor.getNewIsol().then((iso) => {
    console.log("Got : " + iso.perform());
});
//# sourceMappingURL=temp.js.map