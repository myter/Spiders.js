import {SpiderLib} from "../src/spiders";

var spiderLib : SpiderLib = require("../src/spiders")

let app = new spiderLib.Application()

class Actor1 extends spiderLib.Actor{
    tryIt(ref){
        ref.test().then((v)=>{
            console.log("Resolved with: " + v)
        })
    }
}

class Actor2 extends spiderLib.Actor{
    test(){
        /*return new Promise((resolve)=>{
            setTimeout(()=>{
                resolve("worked!")
            },3000)
        })*/
        return "also worked"
    }
}

let a1 = app.spawnActor(Actor1)
let a2 = app.spawnActor(Actor2)
a1.tryIt(a2)