import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
import {PubSubTag} from "../src/PubSub/SubTag";
import {DataService} from "./DataService";
import {GeoService} from "./GeoService";
import {FleetMember} from "./FleetMember";
/**
 * Created by flo on 02/08/2017.
 */
let dataTag = new PubSubTag("Data")
let geoTag = new PubSubTag("Geo")
let monitor : any = new ServiceMonitor()
monitor.installRService(DataService,dataTag,[],null)
monitor.installRService(GeoService,geoTag,[dataTag],null)
monitor.deploy()
setTimeout(()=>{
    let member = new FleetMember()
    member.sendData(5,1,2,3)
},2000)