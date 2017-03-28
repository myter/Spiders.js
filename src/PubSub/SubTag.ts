import {SpiderLib} from "../spiders";
/**
 * Created by flo on 22/03/2017.
 */
var spiders : SpiderLib = require("../spiders")

export class PubSubTag extends spiders.Isolate{
    tagVal : string

    constructor(tagVal : string){
        super()
        this.tagVal = tagVal
    }

    equals(otherTag : PubSubTag){
        otherTag.tagVal == this.tagVal
    }
}