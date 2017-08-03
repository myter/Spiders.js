import {FarRef, SpiderLib} from "../spiders";
import {ServiceGateway} from "./ServiceGateway";
import {PubSubServer} from "../PubSub/SubServer";
/**
 * Created by flo on 30/06/2017.
 */
var spiders : SpiderLib = require("../spiders")
export class ServiceMonitor extends PubSubServer{
    gatewayRef
    services    : Map<string,FarRef>

    logInfo(msg : string){
        console.log("[INFO] " + msg)
    }

    warnInfo(msg : string){
        console.log("[WARNING] " + msg)
    }

    private deployService(currentDir : string,serviceName : string, definitionPath : string,className : string){
        //TODO configuration arguments
        if(definitionPath.startsWith(".")){
            definitionPath = currentDir + definitionPath.slice(1,definitionPath.length)
        }
        this.logInfo("Deploying service : " + serviceName + " definition path: " + definitionPath)
        let actorRef        = this.spawnActorFromFile(definitionPath,className)
        this.services.set(serviceName,actorRef)
    }

    private listServices(){
        this.logInfo("Current active services:")
        this.services.forEach((_,serviceName : string)=>{
            this.logInfo("- " + serviceName)
        })
    }

    constructor(){
        super()
        this.services   = new Map()
        var stdin       = (process as any).openStdin();
        var that        = this
        stdin.addListener("data", function(d) {
            let command = d.toString().trim()
            let args    = command.split(" ")
            console.log("[DEBUG] Command : " + command)
            switch(args[0]){
                case "deploy":
                    let serviceName     = args[1].toString()
                    var definitionPath  = args[2].toString()
                    let className
                    if(args[3] == undefined){
                        className = serviceName
                    }
                    else{
                        className = args[3].toString()
                    }
                    that.deployService(process.cwd(),serviceName,definitionPath,className)
                    break
                case "deploy-all":
                    let serviceNames    = JSON.parse(args[1])
                    var definitionPath  = args[2].toString()
                    let classNames      = JSON.parse(args[3])
                    serviceNames.forEach((serviceName,index)=>{
                        that.deployService(process.cwd(),serviceName,definitionPath,classNames[index])
                    })
                    break
                case "ls-services":
                    that.listServices()
                    break
                case "update":
                    //TODO re-deploy the service with the specified name, new file definition is optional
                    break
                default:
                    console.log("Unknown command")
            }
        })
        //this.gatewayRef = this.spawnActor(ServiceGateway)
    }
}