Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
//var spiders = require('spiders.js')
/*class TestTrait extends ActorTrait{
    testValue
    testMethod(){
        return 666
    }
    constructor(myActor){
        super(myActor)
        this.testValue = 555
    }
}
class SuperTrait extends TestTrait{
    testMethod(){
        return super.testMethod() + 666
    }

    testBridge(){
        console.log(this.myActor.someActMethod())
    }
}

class TestActor extends Actor{
    TestTrait
    constructor(){
        super()
        this.TestTrait = SuperTrait
    }
    someActMethod(){
        return "act method called"
    }
    init(){
        console.log("Actor has been initialised!!")
        this.installTrait(new this.TestTrait(this))
        console.log(this.testValue)
        console.log(this.testMethod())
        this.testBridge()
    }
}
let app = new Application()
app.spawnActor(TestActor)*/
let app = new spiders_1.Application();
class TestTrait extends spiders_1.ActorTrait {
    constructor(myActor) {
        super(myActor);
        this.baseValue = 5;
    }
    traitMethod() {
        return this.baseValue;
    }
}
class SuperTrait extends TestTrait {
    traitMethod() {
        return super.traitMethod() + this.myActor.someValue;
    }
}
class TraitActor extends spiders_1.Actor {
    constructor() {
        super();
        this.SuperTrait = SuperTrait;
    }
    init() {
        this.someValue = 5;
        this.installTrait(new this.SuperTrait(this));
        /*console.log("Actor init")
        console.log(this.traitMethod())*/
    }
    test() {
        return this.traitMethod();
    }
}
let act = app.spawnActor(TraitActor);
act.test().then((v) => {
    console.log(v);
});
//# sourceMappingURL=temp.js.map