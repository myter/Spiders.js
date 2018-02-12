import {Application} from "../src/spiders"
class Server extends Application{
    constructor(){
        super()
        this.libs.serveApp("./WebTest.html","./client.js","bundle.js",8888)
        console.log("App online")
    }
}
new Server()