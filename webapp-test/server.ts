import {Application} from "../src/spiders";

const simpleServerPort              = 8887
const resourceServerPort            = 8888
export const varServerPort          = 8889
export class Server extends Application{
    constructor(){
        super()
        this.libs.serveApp("./simpleClient.html","./SimpleClient.js",simpleServerPort).then(()=>{
            console.log("Server running on " + simpleServerPort)
        })
        let resourceOptions                     = {
            publicResourceURL :'/public',
            pathToPublicResource : './public'
        }
        this.libs.serveApp("./resourceClient.html","./ResourceClient.js",resourceServerPort,resourceOptions).then(()=>{
            console.log("Resource Server running on " + resourceServerPort)
        })
        let varMappings                         = new Map()
        varMappings.set("foo",1)
        let globalVarOptions                    = {
            globalVarMappings : varMappings,
        }
        this.libs.serveApp("./GlobalVarClient.html","./GlobalVarClient.js",varServerPort,globalVarOptions).then(()=>{
            console.log("Global Var Server running on " + varServerPort)
        })
    }

    handShake(){
        return "ok"
    }
}

new Server()