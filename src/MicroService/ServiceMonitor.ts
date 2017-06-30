import {SpiderLib} from "../spiders";
import {ServiceGateway} from "./ServiceGateway";
/**
 * Created by flo on 30/06/2017.
 */
var spiders : SpiderLib = require("../spiders")
export class ServiceMonitor extends spiders.Application{
    gatewayRef

    constructor(){
        super()
        var stdin = (process as any).openStdin();
        stdin.addListener("data", function(d) {
            let command = d.toString().trim()
            switch(command){
                case "deploy":
                    console.log("Deploying")
                    break
                default:
                    console.log("Unknown command")
            }
        })
        this.gatewayRef = this.spawnActor(ServiceGateway)
    }
}