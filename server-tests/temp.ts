import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require("../src/spiders")
let app = new spiders.Application()
class ActorA extends spiders.Actor{
    test(someRef){
        return someRef === this
    }
}
class ActorB extends spiders.Actor{

}
let a = app.spawnActor(ActorA)
let b = app.spawnActor(ActorB)
console.log("Equal? " + (a === b))
a.test(a).then((res)=>{
    console.log("Ref equal?: " + res)
})

