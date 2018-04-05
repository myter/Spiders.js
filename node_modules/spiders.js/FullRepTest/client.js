var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TestRepliq extends spiders.Repliq {
    constructor() {
        super();
        this.val = 1;
    }
    inc() {
        this.val = this.val.read() + 1;
    }
}
__decorate([
    spiders.Count
], TestRepliq.prototype, "val", void 0);
class TestApp extends spiders.Application {
    constructor() {
        super();
        this.remote("127.0.0.1", 8888).then((serverRef) => {
            this.server = serverRef;
            console.log("Connected to server");
            //serverRef.newClient(this)
            if (window["isFirst"]) {
                this.masterRep = this.newRepliq(TestRepliq);
                this.masterRep.val.onCommit(() => {
                    console.log("New value on master: " + this.masterRep.val);
                });
                serverRef.pushReplica(this.masterRep);
                this.update(5);
            }
            else {
                serverRef.newClient(this);
            }
        });
    }
    getRepliq(repliq) {
        this.slaveRep = repliq;
        console.log("Got repliq. init val: " + repliq.val);
        repliq.val.onCommit(() => {
            console.log("New value for repliq: " + repliq.val);
        });
    }
    masterDone() {
        this.slaveRep.inc();
    }
    update(count) {
        if (count > 0) {
            setTimeout(() => {
                this.masterRep.inc();
                this.update(--count);
            }, 2000);
        }
        else {
            this.server.masterDone();
        }
    }
}
new TestApp();
//# sourceMappingURL=client.js.map