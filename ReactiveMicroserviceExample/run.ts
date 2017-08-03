import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
/**
 * Created by flo on 02/08/2017.
 */
let monitor : any = new ServiceMonitor()
monitor.deployService(process.cwd(),"Fleet member","./FleetMember","FleetMember")
monitor.deployService(process.cwd(),"Parsing Service","./ParsingService","ParsingService")
monitor.deployService(process.cwd(),"Driving Service","./DrivingService","DrivingService")
monitor.deployService(process.cwd(),"Geo Service","./GeoService","GeoService")
monitor.deployService(process.cwd(),"Dashboard Service","./DashboardService","DashboardService")
//deploy FleetMember ./FleetMember FleetMember