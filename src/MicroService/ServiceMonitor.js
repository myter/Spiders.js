Object.defineProperty(exports, "__esModule", { value: true });
const ServiceGateway_1 = require("./ServiceGateway");
const SubServer_1 = require("../PubSub/SubServer");
/**
 * Created by flo on 30/06/2017.
 */
var spiders = require("../spiders");
class ServiceMonitor extends SubServer_1.PubSubServer {
    logInfo(msg) {
        console.log("[INFO] " + msg);
    }
    deployService(currentDir, serviceName, definitionPath, className) {
        //TODO configuration arguments
        if (definitionPath.startsWith(".")) {
            definitionPath = currentDir + definitionPath.slice(1, definitionPath.length);
        }
        this.logInfo("Deploying service : " + serviceName + " definition path: " + definitionPath);
        let actorRef = this.spawnActorFromFile(definitionPath, className);
        this.services.set(serviceName, actorRef);
    }
    listServices() {
        this.logInfo("Current active services:");
        this.services.forEach((_, serviceName) => {
            this.logInfo("- " + serviceName);
        });
    }
    constructor() {
        super();
        this.services = new Map();
        var stdin = process.openStdin();
        var that = this;
        stdin.addListener("data", function (d) {
            let command = d.toString().trim();
            let args = command.split(" ");
            console.log("[DEBUG] Command : " + command);
            switch (args[0]) {
                case "deploy":
                    let serviceName = args[1].toString();
                    let definitionPath = args[2].toString();
                    let className;
                    if (args[3] == undefined) {
                        className = serviceName;
                    }
                    else {
                        className = args[3].toString();
                    }
                    that.deployService(process.cwd(), serviceName, definitionPath, className);
                    break;
                case "ls-services":
                    that.listServices();
                    break;
                case "update":
                    //TODO re-deploy the service with the specified name, new file definition is optional
                    break;
                default:
                    console.log("Unknown command");
            }
        });
        this.gatewayRef = this.spawnActor(ServiceGateway_1.ServiceGateway);
    }
}
exports.ServiceMonitor = ServiceMonitor;
//# sourceMappingURL=ServiceMonitor.js.map