import {SpiderLib} from "../src/spiders";
/**
 * Created by flo on 02/08/2017.
 */
var spiders : SpiderLib = require("../src/spiders")

export class FleetData extends spiders.Signal{
    id:     string
    lat:    string
    lon:    string
    speed:  string

    constructor(id,lat,lon,speed){
        super()
        this.id     = id
        this.lat    = lat
        this.lon    = lon
        this.speed  = speed
    }

    @spiders.mutator
    actualise(newLat,newLon,newSpeed){
        this.lat    = newLat
        this.lon    = newLon
        this.speed  = newSpeed
    }
}