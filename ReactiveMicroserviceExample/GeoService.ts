import {MicroService} from "../src/MicroService/MicroService";
import {FleetData} from "./FleetData";
/**
 * Created by flo on 02/08/2017.
 */
export class GeoService extends MicroService{
    init(){
        let inTopic     = this.newTopic("ParsedData")
        let outTopic    = this.newTopic("GeoData")
        let reverseGeoCode = this.lift((fleetData : FleetData)=>{
            //Just return string containing latitude and longitude
            return fleetData[0].toString() + " , " + fleetData[1].toString()
        })
        this.subscribe(inTopic).each((dataSignal)=>{
            let address = reverseGeoCode(dataSignal)
            this.publish(address,outTopic)
        })
    }
}