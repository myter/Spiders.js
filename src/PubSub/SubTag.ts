import {SpiderLib} from "../spiders";
import {IsolateContainer} from "../serialisation";
/**
 * Created by flo on 22/03/2017.
 */
var spiders : SpiderLib = require("../spiders")

export class PubSubTag{
    tagVal : string

    constructor(tagVal : string){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.tagVal = tagVal
    }

    equals(otherTag : PubSubTag){
        otherTag.tagVal == this.tagVal
    }

    asString(){
        return this.tagVal
    }
}