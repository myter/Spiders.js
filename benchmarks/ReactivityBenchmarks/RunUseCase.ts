import {ServiceMonitor} from "../../src/MicroService/ServiceMonitor";
import {Admitter, DashboardService, DataAccessService, DrivingService, GeoService} from "./UseCase";
let isQPROP = process.argv[2] == "true"
let toSpawn = process.argv[3]
switch (toSpawn){
    case "admitter":
        new Admitter()
        break
    case "monitor":
        new ServiceMonitor()
        break
    case "data":
        new DataAccessService(2000,isQPROP)
        break
    case "driving":
        new DrivingService(isQPROP)
        break
    case "geo":
        new GeoService(isQPROP)
        break
    case "dash":
        new DashboardService(isQPROP)
        break
    default:
        throw new Error("unknown spawning argument")
}