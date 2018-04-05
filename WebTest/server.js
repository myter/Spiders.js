Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class Server extends spiders_1.Application {
    constructor() {
        super();
        this.libs.serveApp("./WebTest.html", "./client.js", "bundle.js", 8888);
        console.log("App online");
    }
}
new Server();
//# sourceMappingURL=server.js.map