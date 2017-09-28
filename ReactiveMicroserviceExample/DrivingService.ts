import {MicroService} from "../src/MicroService/MicroService";
import {FleetData} from "./FleetData";
/**
 * Created by flo on 02/08/2017.
 */
export class DrivingService extends MicroService {
    init(){
        let inTopic         = this.newTopic("ParsedData")
        let outTopic        = this.newTopic("DrivingData")
        let drivingScore    = this.lift((fleetData)=>{
            let rand = Math.random()
            //generate fictive driving score
            if(fleetData[2] % 2 == 0){
                return "good"
            }
            else{
                return "bad"
            }
        })
        this.subscribe(inTopic).each((dataSignal)=>{
            let score = drivingScore(dataSignal)
            this.publish(score,outTopic)
        })
    }
}