import {MicroService} from "../src/MicroService/MicroService";
import {AddressData} from "./GeoService";
/**
 * Created by flo on 02/08/2017.
 */
export class DashboardService extends MicroService{
    start(inputSignals){
        this.lift(([drivingData,geoData,configData])=>{
            drivingData.then((violation)=>{
                geoData.then((address : AddressData)=>{
                    if(!configData){
                        console.log("Driving: " + violation + " geo: " + address.address)
                    }
                    else if (configData.type == "short"){
                        console.log("Driving: " + violation + " geo: " + address.address)
                    }
                    else{
                        console.log("Dashboard updated to: " + violation + " geographical poistion: " + address.address)
                    }
                })
            })
        })(inputSignals)
    }
}