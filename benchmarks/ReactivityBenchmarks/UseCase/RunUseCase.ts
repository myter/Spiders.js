import {ServiceMonitor} from "../../../src/MicroService/ServiceMonitor";
import {Admitter, ConfigService, DashboardService, DataAccessService, DrivingService, GeoService} from "./UseCase";
let isQPROP     = process.argv[2] == "true"
let toSpawn     = process.argv[3]
let dataRate    = parseInt(process.argv[4])
let totalVals   = dataRate * 60
let csvFile     = process.argv[5]
switch (toSpawn){
    case "admitter":
        new Admitter(totalVals,csvFile,dataRate)
        break
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