import {makeMethodAnnotation} from "../src/utils";
import {Application, SpiderIsolate, SpiderObject,SpiderObjectMirror,Actor} from "../src/spiders";


let foo = makeMethodAnnotation((mirr : SpiderObjectMirror)=>{console.log("annot triggered")})
class Test extends SpiderIsolate{
    @foo
    meth(){
        console.log("Original called")
    }
}

class App extends Application{
    send(){
        let t = new Test()
        console.log("Invoking in app")
        t.meth()
        act.getIsol(t)
    }
}

class Act extends Actor{
    getIsol(i){
        console.log("Invoking in Actor")
        i.meth()
    }
}

let app = new App()
let act = app.spawnActor(Act)
app.send()