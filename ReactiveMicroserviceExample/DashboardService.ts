import {MicroService} from "../src/MicroService/MicroService";
/**
 * Created by flo on 02/08/2017.
 */
export class DashboardService extends MicroService{
    /*init(){
        let geoTopic        = this.newTopic("GeoData")
        let drivingtopic    = this.newTopic("DrivingData")
        let updateMap       = this.lift((address)=>{
            console.log(address)
        })
        let updateDriving   = this.lift((score)=>{
            console.log(score)
        })
        this.subscribe(geoTopic).each((dataSignal)=>{
            updateMap(dataSignal)
        })
        this.subscribe(drivingtopic).each((dataSignal)=>{
            updateDriving(dataSignal)
        })
    }*/
    start(inputSignals){
        this.lift(([drivingData,geoData])=>{
            console.log("Driving: " + drivingData + " geo: " + geoData)
        })(inputSignals)
    }
}