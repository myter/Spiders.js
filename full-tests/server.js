Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
var app = new spiders.Application();
class ServerActor1 extends spiders.Actor {
    constructor(act2Ref) {
        super();
        this.clients = [];
        this.act2Ref = act2Ref;
    }
    register(clientRef) {
        this.clients.push(clientRef);
        if (this.clients.length > 1) {
            this.act2Ref.setupForRouting(this.clients[0], this.clients[1]);
        }
        return true;
    }
}
class ServerActor2 extends spiders.Actor {
    setupForRouting(target, c) {
        target.meet(c);
    }
}
let act2 = app.spawnActor(ServerActor2, [], 8081);
app.spawnActor(ServerActor1, [act2], 8080);
//# sourceMappingURL=server.js.map