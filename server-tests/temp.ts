import {makeMethodAnnotation} from "../src/utils";
import {Application, SpiderIsolate, SpiderObject,SpiderObjectMirror,Actor} from "../src/spiders";


let foo = makeMethodAnnotation((mirr : SpiderObjectMirror)=>{console.log("annot triggered")},"foo")
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
        let mirr = this.libs.reflectOnObject(t)
        if(mirr.isAnnotated("meth")){
            console.log("Meth annotated")
        }
        else{
            console.log("Meth not annotated")
        }
        console.log(mirr.isAnnotated("meth"))
        console.log(mirr.getAnnotationTag("meth"))
        console.log(mirr.getAnnotationCall("meth").toString())
    }
}

class Act extends Actor{
    getIsol(i){
        console.log("Invoking in Actor")
        i.meth()
        let mirr = this.libs.reflectOnObject(i)
        console.log(mirr.isAnnotated("meth"))
        console.log(mirr.getAnnotationTag("meth"))
        console.log(mirr.getAnnotationCall("meth").toString())
    }
}

let app = new App()
let act = app.spawnActor(Act)
app.send()