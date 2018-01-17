/**
 * Created by flo on 16/03/2017.
 */
import {SpiderLib} from "../spiders";
/**
 * Created by flo on 09/03/2017.
 */


var spiders : SpiderLib = require("../spiders")
export class Round extends spiders.SpiderIsolate{
    objectId        : string
    masterOwnerId   : string
    roundNumber     : number
    methodName      : string
    args            : Array<any>

    constructor(objectId : string,masterOwnerId : string,roundNumber : number,methodName : string,args : Array<any>){
        super()
        this.objectId       = objectId
        this.masterOwnerId  = masterOwnerId
        this.roundNumber    = roundNumber
        this.methodName     = methodName
        this.args           = args
    }
}