Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 30/06/2017.
 */
var spiders = require("../spiders");
class ServiceMonitor extends spiders.Application {
    logInfo(msg) {
        console.log("[INFO] " + msg);
    }
    warnInfo(msg) {
        console.log("[WARNING] " + msg);
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
        this.PSServer();
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
                    var definitionPath = args[2].toString();
                    let className;
                    if (args[3] == undefined) {
                        className = serviceName;
                    }
                    else {
                        className = args[3].toString();
                    }
                    that.deployService(process.cwd(), serviceName, definitionPath, className);
                    break;
                case "deploy-all":
                    let serviceNames = JSON.parse(args[1]);
                    var definitionPath = args[2].toString();
                    let classNames = JSON.parse(args[3]);
                    serviceNames.forEach((serviceName, index) => {
                        that.deployService(process.cwd(), serviceName, definitionPath, classNames[index]);
                    });
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
    }
}
exports.ServiceMonitor = ServiceMonitor;
//# sourceMappingURL=ServiceMonitor.js.map