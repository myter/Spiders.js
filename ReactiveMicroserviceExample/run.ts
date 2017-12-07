import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
import {PubSubTag} from "../src/PubSub/SubTag";
import {DataService} from "./DataService";
import {GeoService} from "./GeoService";
import {FleetMember} from "./FleetMember";
import {DrivingService} from "./DrivingService";
import {DashboardService} from "./DashboardService";
import {ConfigService, ConfigSignal} from "./ConfigService";
/**
 * Created by flo on 02/08/2017.
 */
let monitor : any = new ServiceMonitor()
let dataTag = new PubSubTag("Data")
let geoTag = new PubSubTag("Geo")
let drivingTag = new PubSubTag("Driving")
let dashTag     = new PubSubTag("Dash")
let configTag   = new PubSubTag("Config")

monitor.installRService(DataService,dataTag,[],null)
monitor.installRService(GeoService,geoTag,[dataTag],null)
monitor.installRService(DrivingService,drivingTag,[dataTag,geoTag],null)
monitor.installRService(DashboardService,dashTag,[drivingTag,geoTag,configTag],null)
monitor.installRService(ConfigService,configTag,[],new ConfigSignal())

monitor.deploy()
let loop = () => {
    setTimeout(()=>{
        let member = new FleetMember()
        member.sendData(5,33.7489,-84.3789,3)
        loop()
    },4000)
}
loop()
