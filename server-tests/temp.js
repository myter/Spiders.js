Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestApp extends spiders_1.Application {
    say(msg) {
        console.log("App got: " + msg);
    }
}
let app = new TestApp();
class TestActor extends spiders_1.Actor {
    init() {
        console.log("ACTOR ID = " + this.libs.environment.thisRef.ownerId);
    }
    test(appRef) {
        //this.libs.offline()
        /*appRef.say("Hey from actor")
        setTimeout(()=>{
            console.log("Opening up again")
            this.libs.online()
        },3000)*/
    }
}
let act = app.spawnActor(TestActor);
act.test(app);
app.libs.offline();
setTimeout(() => {
    console.log("GOING ONLINE");
    app.libs.online();
}, 3000);
//# sourceMappingURL=temp.js.map