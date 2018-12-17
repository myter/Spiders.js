import {Application, SpiderIsolate,Actor} from "../src/spiders";

class Test extends Actor{
    init(){
        console.log("Actor init")
    }
}

let app = new Application()
app.spawnActor(Test)

