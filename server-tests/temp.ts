import {SpiderLib} from "../src/spiders";
import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
var spiders : SpiderLib = require("../src/spiders")
console.log("Creating")
let monitor = new ServiceMonitor()
console.log("Created")
//deploy TestService ./tempServiceDefinition FastPubTestService
//deploy TestService ./tempServiceDefinition SlowPubTestService
//deploy TestService ./tempServiceDefinition SubTestService
//deploy-all ["TestService","TestService","TestService"] ./tempServiceDefinition ["SubTestService","SlowPubTestService","FastPubTestService"]

