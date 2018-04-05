import {FarRef, SpiderLib} from "../spiders";
import {PubSubTag} from "../PubSub/SubTag";
import {IsolateContainer} from "../serialisation";
/**
 * Created by flo on 30/06/2017.
 */
var spiders : SpiderLib = require("../spiders")
class PreInstallInfo{
    serviceClass
    serviceTag      : PubSubTag
    dependencies    : Array<PubSubTag>
    dependants      : Array<PubSubTag>
    initialVal      : any

    constructor(serviceClass,serviceTag,dependencies,initialVal){
        this.serviceClass   = serviceClass
        this.serviceTag     = serviceTag
        this.dependencies   = dependencies
        this.dependants     = []
        this.initialVal     = initialVal
    }
}

export class GraphInfo{
    ownType
    directParents
    directChildren
    initialValue

    constructor(ownType,directParents,directChildren,initialValue){
        this[IsolateContainer.checkIsolateFuncKey]  = true
        this.ownType                                = ownType
        this.directParents                          = directParents
        this.directChildren                         = directChildren
    }
}
export class ServiceMonitor extends spiders.Application{
    services    : Map<string,FarRef>
    toDeploy    : Map<string,PreInstallInfo>

    logInfo(msg : string){
        console.log("[INFO] " + msg)
    }

    warnInfo(msg : string){
        console.log("[WARNING] " + msg)
    }

    //Register a service provided the service's class and the list of services it depends on
    installRService(serviceClass,serviceTag : PubSubTag,dependencies : Array<PubSubTag>,initialVal){
        this.toDeploy.set(serviceTag.tagVal,new PreInstallInfo(serviceClass,serviceTag,dependencies,initialVal))
    }

    //Deploys all services and wires together the dependency graph
    deploy(){
        //Add dependants information for each service
        this.toDeploy.forEach((info : PreInstallInfo)=>{
            info.dependencies.forEach((dependency : PubSubTag)=>{
                this.toDeploy.get(dependency.tagVal).dependants.push(info.serviceTag)
            })
        })
        //Spawn each service and make it setup QPROP using dependency information
        this.toDeploy.forEach((info : PreInstallInfo)=>{
            let service     = this.spawnActor(info.serviceClass)
            let graphInfo   = new GraphInfo(info.serviceTag,info.dependencies,info.dependants,info.initialVal)
            service.setupInfo(graphInfo)
        })
    }


    //Used for command line interface
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

    constructor(ip = "127.0.0.1",port=8000){
        super(ip,port)
        this.PSServer(ip,port)
        this.services   = new Map()
        this.toDeploy   = new Map()
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
    }
}