import {SpiderLib} from "../src/spiders";

var spiderLib : SpiderLib = require("../src/spiders")

class Service extends spiderLib.Application{
    constructor(){
        super()
        this.remote("ip",8000).then((serviceRef)=>{

        })
    }
}
new Service()