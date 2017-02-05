import {SpiderLib, FarRef} from "../src/spiders";
/**
 * Created by flo on 25/01/2017.
 */
var spider : SpiderLib = require('../src/spiders')
var app = new spider.Application()
class SuperActor extends spider.Actor{
    init(){
        console.log("Super Init")
    }
}
class BaseActor extends spider.Actor{
    val
    constructor(){
        super()
        this.val = 10
    }
    init(){
        console.log("Base init")
        console.log("Val = " + this.val)
    }
    getArray(arr){
        console.log("Val inside array: " + this.val)
        console.log(arr.length)
    }
}
var a = app.spawnActor(BaseActor)
a.getArray([1,2,3])