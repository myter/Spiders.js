import {Application,Actor} from "spiders.js"
class MyApplication extends Application{
    rcvMsg(msg : string){
        console.log(msg)
    }
}

class MyActor extends Actor{
    init(){
        console.log("Actor online")
        this.parent.rcvMsg("Hello from actor")
    }
}
let app = new MyApplication()
app.spawnActor(MyActor)