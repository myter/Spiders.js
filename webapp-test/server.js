Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
const simpleServerPort = 8887;
const resourceServerPort = 8888;
exports.varServerPort = 8889;
class Server extends spiders_1.Application {
    constructor() {
        super();
        this.libs.serveApp("./simpleClient.html", "./SimpleClient.js", "simpleBundle.js", simpleServerPort).then(() => {
            console.log("Server running on " + simpleServerPort);
        });
        let resourceOptions = new spiders_1.WebAppOptions();
        resourceOptions.publicResourceURL = '/public';
        resourceOptions.pathToPublicResource = './public';
        this.libs.serveApp("./resourceClient.html", "./SimpleClient.js", "resourceBundle.js", resourceServerPort, resourceOptions).then(() => {
            console.log("Resource Server running on " + resourceServerPort);
        });
        let varMappings = new Map();
        varMappings.set("foo", "666");
        let globalVarOptions = new spiders_1.WebAppOptions();
        globalVarOptions.globalVarMappings = varMappings;
        this.libs.serveApp("./GlobalVarClient.html", "./GlobalVarClient.js", "globalVarBundle.js", exports.varServerPort, globalVarOptions).then(() => {
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