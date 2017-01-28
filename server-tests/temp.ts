import {SpiderLib, FarRef} from "../src/spiders";
/**
 * Created by flo on 25/01/2017.
 */
var spider : SpiderLib = require('../src/spiders')
//class testApp extends spider.Application{}
    class referencedActor extends spider.Actor {
        getValue() {
            return 5;
        }
    }
    class referencingActor extends spider.Actor {
        constructor(actorReference) {
            super();
            //console.log("Creating with : " + actorReference)
            this.ref = actorReference;
        }
        getValue(){
            return this.ref.getValue().then((v) => { return v; });
        }
    }

    var app = new spider.Application()

    var actor1 = app.spawnActor(referencedActor);
    var actor2 = app.spawnActor(referencingActor,[actor1],8081);
    actor2.getValue().then((v) => {
        console.log("Got : " + v )
    })

/*class X{
        constructor(val){
            this.v = val
        }
}
var Xer = X
var xx = new Xer(...[5])
console.log(xx.v)*/