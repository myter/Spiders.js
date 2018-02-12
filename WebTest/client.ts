import {Application} from "../src/spiders"

class Client extends Application{
    constructor(){
        super()
        console.log("Client created")
        this.libs.remote("127.0.0.1",8000).then((serverRef)=>{
            console.log("Connected to server")
        })
    }
}
new Client()