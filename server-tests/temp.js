Object.defineProperty(exports, "__esModule", { value: true });
const ServiceMonitor_1 = require("../src/MicroService/ServiceMonitor");
var spiders = require("../src/spiders");
console.log("Creating");
let monitor = new ServiceMonitor_1.ServiceMonitor();
console.log("Created");
//deploy TestService ./tempServiceDefinition FastPubTestService
//deploy TestService ./tempServiceDefinition SlowPubTestService
//deploy TestService ./tempServiceDefinition SubTestService
//deploy-all ["TestService","TestService","TestService"] ./tempServiceDefinition ["SubTestService","SlowPubTestService","FastPubTestService"]
//# sourceMappingURL=temp.js.map