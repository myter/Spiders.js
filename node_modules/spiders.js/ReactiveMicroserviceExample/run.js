Object.defineProperty(exports, "__esModule", { value: true });
const ServiceMonitor_1 = require("../src/MicroService/ServiceMonitor");
const SubTag_1 = require("../src/PubSub/SubTag");
const DataService_1 = require("./DataService");
const GeoService_1 = require("./GeoService");
const FleetMember_1 = require("./FleetMember");
const DrivingService_1 = require("./DrivingService");
const DashboardService_1 = require("./DashboardService");
const ConfigService_1 = require("./ConfigService");
/**
 * Created by flo on 02/08/2017.
 */
let monitor = new ServiceMonitor_1.ServiceMonitor();
let dataTag = new SubTag_1.PubSubTag("Data");
let geoTag = new SubTag_1.PubSubTag("Geo");
let drivingTag = new SubTag_1.PubSubTag("Driving");
let dashTag = new SubTag_1.PubSubTag("Dash");
let configTag = new SubTag_1.PubSubTag("Config");
monitor.installRService(DataService_1.DataService, dataTag, [], null);
monitor.installRService(GeoService_1.GeoService, geoTag, [dataTag], null);
monitor.installRService(DrivingService_1.DrivingService, drivingTag, [dataTag, geoTag], null);
monitor.installRService(DashboardService_1.DashboardService, dashTag, [drivingTag, geoTag, configTag], null);
monitor.installRService(ConfigService_1.ConfigService, configTag, [], new ConfigService_1.ConfigSignal());
monitor.deploy();
let loop = () => {
    setTimeout(() => {
        let member = new FleetMember_1.FleetMember();
        member.sendData(5, 33.7489, -84.3789, 3);
        loop();
    }, 4000);
};
loop();
//# sourceMappingURL=run.js.map