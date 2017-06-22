/**
 * Created by flo on 07/02/2017.
 */
var spiders = require("../src/spiders");
class MyMainActor extends spiders.Application {
    constructor() {
        super();
        this.counter = 0;
    }
    updateCounter() {
        this.counter += 1;
        var label = document.getElementById("counterLabel");
        label.innerHTML = this.counter.toString();
    }
}
class MyIsolate extends spiders.Isolate {
}
class CounterActor extends spiders.Actor {
    constructor() {
        super();
        this.MyIsolate = MyIsolate;
    }
    init() {
        var that = this;
        this.remote("", 8080).then((serverRef) => {
        });
        setTimeout(() => {
            that.parent.updateCounter();
            that.init();
        }, 500);
    }
    getRef(actorRef) {
    }
}
var app = new MyMainActor();
var ref1 = app.spawnActor(CounterActor);
var ref2 = app.spawnActor(CounterActor);
ref1.getRef(ref2);
ref2.getRef(ref1);
//# sourceMappingURL=app.js.map