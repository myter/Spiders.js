Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
const simpleServerPort = 8887;
const resourceServerPort = 8888;
exports.varServerPort = 8889;
class Server extends spiders_1.Application {
    constructor() {
        super();
        this.libs.serveApp("./simpleClient.html", "./SimpleClient.js", simpleServerPort).then(() => {
            console.log("Server running on " + simpleServerPort);
        });
        let resourceOptions = {
            publicResourceURL: '/public',
            pathToPublicResource: './public'
        };
        this.libs.serveApp("./resourceClient.html", "./ResourceClient.js", resourceServerPort, resourceOptions).then(() => {
            console.log("Resource Server running on " + resourceServerPort);
        });
        let varMappings = new Map();
        varMappings.set("foo", 1);
        let globalVarOptions = {
            globalVarMappings: varMappings,
        };
        this.libs.serveApp("./GlobalVarClient.html", "./GlobalVarClient.js", exports.varServerPort, globalVarOptions).then(() => {
            console.log("Global Var Server running on " + exports.varServerPort);
        });
    }
    handShake() {
        return "ok";
    }
}
exports.Server = Server;
new Server();
//# sourceMappingURL=server.js.map