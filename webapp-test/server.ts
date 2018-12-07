import {Application, WebAppOptions} from "../src/spiders";

const simpleServerPort      = 8887
const resourceServerPort    = 8888
export const varServerPort         = 8889
export class Server extends Application{
    constructor(){
        super()
        this.libs.serveApp("./simpleClient.html","./SimpleClient.js","simpleBundle.js",simpleServerPort).then(()=>{
            console.log("Server running on " + simpleServerPort)
        })
        let resourceOptions                     = new WebAppOptions()
        resourceOptions.publicResourceURL       = '/public'
        resourceOptions.pathToPublicResource    = './public'
        this.libs.serveApp("./resourceClient.html","./SimpleClient.js","resourceBundle.js",resourceServerPort,resourceOptions).then(()=>{
            console.log("Resource Server running on " + resourceServerPort)
        })
        let varMappings                         = new Map()
        varMappings.set("foo","666")
        let globalVarOptions                    = new WebAppOptions()
        globalVarOptions.globalVarMappings      = varMappings
        this.libs.serveApp("./GlobalVarClient.html","./GlobalVarClient.js","globalVarBundle.js",varServerPort,globalVarOptions).then(()=>{
            console.log("Global Var Server running on " + varServerPort)
        })
    }

    handShake(){
        return "ok"
    }
}

new Server()