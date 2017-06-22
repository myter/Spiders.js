Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
var app = new spiders.Application();
class MySourceActor extends spiders.Actor {
    init() {
        this.source = this.newSignal(5);
        let inter1 = this.lift((sourceSignalVal) => {
            return sourceSignalVal + 5;
        })(this.source);
        let inter2 = this.lift((sourceSignalVal) => {
            return sourceSignalVal + 10;
        })(this.source);
        this.sink = this.lift((interVal1, interVal2) => {
            return "Updated val : " + interVal1 + " , " + interVal2;
        })(inter1, inter2);
    }
    getResultSignal() {
        return this.sink;
    }
    changeSource(val) {
        this.source.change(val);
    }
}
class MySinkActor extends spiders.Actor {
    constructor(refToSourceActor) {
        super();
        this.refToSourceActor = refToSourceActor;
    }
    init() {
        this.refToSourceActor.getResultSignal().then((sig) => {
            this.lift((sinkVal) => {
                console.log("Sink val update in sink actor with: " + sinkVal);
            })(sig);
        });
    }
}
let ref = app.spawnActor(MySourceActor);
app.spawnActor(MySinkActor, [ref]);
function changeVal(i) {
    setTimeout(() => {
        ref.changeSource(i);
        changeVal(i + 1);
    }, 2000);
}
changeVal(1);
//# sourceMappingURL=temp.js.map