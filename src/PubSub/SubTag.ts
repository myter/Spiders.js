import {SpiderIsolate} from "../MOP";

/**
 * Created by flo on 22/03/2017.
 */

export class PubSubTag extends SpiderIsolate{
    tagVal : string

    constructor(tagVal : string){
        super()
        this.tagVal = tagVal
    }

    equals(otherTag : PubSubTag){
        otherTag.tagVal == this.tagVal
    }

    asString(){
        return this.tagVal
    }
}