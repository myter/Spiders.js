import {MicroService} from "../src/MicroService/MicroService";
import {AddressData} from "./GeoService";
import {API_KEY} from "./ExampleConfig";
/**
 * Created by flo on 02/08/2017.
 */
export class DrivingService extends MicroService {
    API_KEY

    constructor(){
        super()
        this.API_KEY = API_KEY
    }
    start(inputSignals){
        let exp = this.lift(([fleetData,addressData])=>{
            return addressData.then((addressObject : AddressData)=>{
                let place = addressObject.place
                return this.speedViolation(place,fleetData.speed)
            })
        })(inputSignals)
        this.publishSignal(exp)
    }

    speedViolation(place,currentspeed){
        var request = require('request-promise-native')
        return request("https://roads.googleapis.com/v1/speedLimits?placeId="+place+"&key="+this.API_KEY).then((response)=>{
            let maxSpeed = response.speedLimits[0].speedLimit
            return currentspeed > maxSpeed
        })
            .catch((reason)=>{
                console.log(reason)
            })
    }
}