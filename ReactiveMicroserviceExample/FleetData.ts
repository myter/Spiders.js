import {SpiderLib} from "../src/spiders";
/**
 * Created by flo on 02/08/2017.
 */
var spiders : SpiderLib = require("../src/spiders")

@spiders.lease(3000)
export class FleetData extends spiders.Signal{
    memberId        : string
    currentLat      : number
    currentLong     : number
    currentSpeed    : number

    constructor(id,lat,long,speed){
        super()
        this.memberId = id
        this.currentLat = lat
        this.currentLong = long
        this.currentSpeed = speed
    }

    @spiders.mutator
    actualise(lat,long,speed){
        this.currentLat     = lat
        this.currentLong    = long
        this.currentSpeed   = speed
    }
}