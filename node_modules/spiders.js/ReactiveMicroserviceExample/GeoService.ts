import {MicroService} from "../src/MicroService/MicroService";
import {SpiderLib} from "../src/spiders";
import {API_KEY} from "./ExampleConfig";
/**
 * Created by flo on 02/08/2017.
 */
var spiders : SpiderLib = require("../src/spiders")
var geocoder = require('geocoder')

class AddressSignal extends spiders.Signal{
    aData

    constructor(aData){
        super()
        this.aData = aData
    }

    @spiders.mutator
    update(newA){
        this.aData = newA
    }
}

export class AddressData extends spiders.Isolate{
    address : string
    place   : string

    constructor(address,place){
        super()
        this.address    = address
        this.place      = place
    }
}
export class GeoService extends MicroService{
    AddressSignal
    AddressData
    API_KEY

    constructor(){
        super()
        this.AddressSignal  = AddressSignal
        this.AddressData    = AddressData
        this.API_KEY        = API_KEY
    }

    start(fleetDataSignal){
        //Reverse geo-code (async so return promise)
        let exp = this.lift(([fleetData])=>{
            return this.reverseGeoCode(fleetData.lat,fleetData.lon)
        })(fleetDataSignal)
        this.publishSignal(exp)
    }

    reverseGeoCode(lat,lon){
        var geocoder = require('geocoder')
        var that = this
        return new Promise((resolve)=>{
            geocoder.reverseGeocode( lat, lon, function ( err, data ) {
                if(err){
                    console.log(err)
                }
                resolve(new that.AddressData(data.results[0].formatted_address,data.results[0].place_id))
            },{key:this.API_KEY});
        })
    }
}