/**
 * Created by flo on 25/01/2017.
 */
var spiders = require("../src/spiders");
var app = new spiders.Application();
class SuperActor extends spiders.Actor {
    static statM() {
        return 6;
    }
    regular() {
        console.log("Regular method called");
    }
    testField() {
        return SuperActor.STATFIELD;
    }
    testMethod() {
        return SuperActor.statM();
    }
}
SuperActor.STATFIELD = 5;
class BaseActor extends SuperActor {
    testBaseField() {
        console.log("Base field invoked");
        return BaseActor.BASESTATFIELD = 5;
    }
    testSuperField() {
        return SuperActor.STATFIELD;
    }
}
BaseActor.BASESTATFIELD = 55;
var act = app.spawnActor(BaseActor);
act.testBaseField().then((v) => {
    console.log("Static base field in promise : " + v);
});
act.testSuperField().then((v) => {
    console.log("Static super field in promise :" + v);
});
//# sourceMappingURL=temp.js.map