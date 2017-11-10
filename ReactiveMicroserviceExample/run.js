Object.defineProperty(exports, "__esModule", { value: true });
const ServiceMonitor_1 = require("../src/MicroService/ServiceMonitor");
const SubTag_1 = require("../src/PubSub/SubTag");
const DataService_1 = require("./DataService");
const GeoService_1 = require("./GeoService");
const FleetMember_1 = require("./FleetMember");
/**
 * Created by flo on 02/08/2017.
 */
let dataTag = new SubTag_1.PubSubTag("Data");
let geoTag = new SubTag_1.PubSubTag("Geo");
let monitor = new ServiceMonitor_1.ServiceMonitor();
monitor.installRService(DataService_1.DataService, dataTag, [], null);
monitor.installRService(GeoService_1.GeoService, geoTag, [dataTag], null);
monitor.deploy();
setTimeout(() => {
    let member = new FleetMember_1.FleetMember();
    member.sendData(5, 1, 2, 3);
}, 2000);
//# sourceMappingURL=run.js.map