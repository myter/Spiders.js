import {MicroService} from "../src/MicroService/MicroService";
import {FleetData} from "./FleetData";
/**
 * Created by flo on 02/08/2017.
 */
export class DrivingService extends MicroService {

    start(inputSignals){
        let exp = this.lift(([fleetData,addressData])=>{
            console.log("Driving service updating")
            return "ok"
        })(inputSignals)
        this.publishSignal(exp)
    }

    speedViolation(){
        return new Promise((resolve,reject)=>{
            resolve(false)
        })
    }
}