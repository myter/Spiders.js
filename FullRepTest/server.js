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
class Server extends spiders.Application {
    constructor() {
        super("127.0.0.1", 8888);
        this.clients = [];
        this.repliq = this.newRepliq(TestRepliq);
        console.log("Server running");
        //this.update(0)
    }
    newClient(clientRef) {
        this.clients.push(clientRef);
        if (this.rep != null) {
            clientRef.getRepliq(this.rep);
        }
    }
    pushReplica(rep) {
        this.rep = rep;
        this.clients.forEach((client) => {
            client.getRepliq(rep);
        });
    }
    masterDone() {
        this.clients.forEach((client) => {
            client.masterDone();
        });
    }
    update(updated) {
        if (updated < 20) {
            setTimeout(() => {
                this.repliq.inc();
                this.update(++updated);
            }, 2000);
        }
        else {
            console.log("Final server value: " + this.repliq.val);
        }
    }
}
new Server();
//# sourceMappingURL=server.js.map