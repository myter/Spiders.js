import {SpiderLib, FarRef} from "../src/spiders";
/**
 * Created by flo on 07/02/2017.
 */
var spiders : SpiderLib = require("../src/spiders")
class MyMainActor extends spiders.Application{
    counter : number
    constructor(){
        super()
        this.counter = 0
    }
    updateCounter(){
        this.counter += 1
        var label = (document.getElementById("counterLabel") as HTMLLabelElement)
        label.innerHTML = this.counter.toString()
    }
}
class MyIsolate extends spiders.Isolate{

}
class CounterActor extends spiders.Actor{
    MyIsolate
    constructor(){
        super()
        this.MyIsolate = MyIsolate
    }
    init(){
        var that = this
        this.remote("",8080).then((serverRef)=>{

        })
        setTimeout(()=>{
            that.parent.updateCounter()
            that.init()
        },500)
    }

    getRef(actorRef : FarRef){

    }
}
var app = new MyMainActor()
var ref1 : FarRef = app.spawnActor(CounterActor)
var ref2 : FarRef = app.spawnActor(CounterActor)
ref1.getRef(ref2)
ref2.getRef(ref1)