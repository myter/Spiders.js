import {MicroService} from "../src/MicroService/MicroService";
import {FleetData} from "./FleetData";
import {SpiderLib} from "../src/spiders";
/**
 * Created by flo on 02/08/2017.
 */
var spiders : SpiderLib = require("../src/spiders")
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
export class GeoService extends MicroService{
    AddressSignal
    constructor(){
        super()
        this.AddressSignal = AddressSignal
    }

    start(fleetDataSignal){
        //Reverse geo-code (async so return promise)
        let exp = this.lift(([fleetData])=>{
            /*let sig : any = this.newSignal(this.AddressSignal)
            this.reverseGeoCode(fleetData.lat,fleetData.lon).then((address)=>{
                sig.update(address)
            })
            return sig*/
            console.log("Geo service updating")
            return "ok"
        })(fleetDataSignal)
        this.publishSignal(exp)
    }

    reverseGeoCode(lat,lon){
        return new Promise((resolve,reject)=>{
            resolve("benchmark mode")
        })
    }
}