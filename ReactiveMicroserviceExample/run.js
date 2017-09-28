Object.defineProperty(exports, "__esModule", { value: true });
const ServiceMonitor_1 = require("../src/MicroService/ServiceMonitor");
/**
 * Created by flo on 02/08/2017.
 */
let monitor = new ServiceMonitor_1.ServiceMonitor();
monitor.deployService(process.cwd(), "Fleet member", "./FleetMember", "FleetMember");
monitor.deployService(process.cwd(), "Parsing Service", "./ParsingService", "ParsingService");
monitor.deployService(process.cwd(), "Driving Service", "./DrivingService", "DrivingService");
monitor.deployService(process.cwd(), "Geo Service", "./GeoService", "GeoService");
monitor.deployService(process.cwd(), "Dashboard Service", "./DashboardService", "DashboardService");
//deploy FleetMember ./FleetMember FleetMember 
//# sourceMappingURL=run.js.map