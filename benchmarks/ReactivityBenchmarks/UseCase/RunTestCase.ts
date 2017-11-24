import {ServiceMonitor} from "../../../src/MicroService/ServiceMonitor";
import {ConfigService, DashboardService, DataAccessService, DrivingService, GeoService} from "./TestCase";
let isQPROP     = process.argv[2] == "true"
let toSpawn     = process.argv[3]
let dataRate    = parseInt(process.argv[4])
let totalVals   = dataRate * 30
let csvFile     = process.argv[5]
switch (toSpawn){
    case "monitor":
        new ServiceMonitor()
        break
    case "data":
        new DataAccessService(isQPROP,dataRate,totalVals,csvFile)
        break
    case "config":
        new ConfigService(isQPROP,dataRate,totalVals,csvFile)
        break
    case "driving":
        new DrivingService(isQPROP,dataRate,totalVals,csvFile)
        break
    case "geo":
        new GeoService(isQPROP,dataRate,totalVals,csvFile)
        break
    case "dash":
        new DashboardService(isQPROP,dataRate,totalVals,csvFile)
        break
    default:
        throw new Error("unknown spawning argument")
}