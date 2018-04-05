import {SpiderLib} from "../spiders";
import {SpiderIsolateContainer} from "../serialisation";
/**
 * Created by flo on 22/03/2017.
 */
var spiders : SpiderLib = require("../spiders")

export class PubSubTag{
    tagVal : string

    constructor(tagVal : string){
        this[SpiderIsolateContainer.checkIsolateFuncKey] = true
        this.tagVal = tagVal
    }

    equals(otherTag : PubSubTag){
        otherTag.tagVal == this.tagVal
    }

    asString(){
        return this.tagVal
    }
}