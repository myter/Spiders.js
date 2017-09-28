import {MicroService} from "../src/MicroService/MicroService";
import {FleetData} from "./FleetData";
/**
 * Created by flo on 02/08/2017.
 */

export class FleetMember extends MicroService{
    myId
    dataSignal
    curLat
    curLong
    curSpeed

    getRandom(){
        return Math.floor((Math.random() * 100) + 1)
    }

    init(){
        this.myId = this.getRandom()
        this.curLat = this.getRandom()
        this.curLong = this.getRandom()
        this.curSpeed = this.getRandom()
        this.dataSignal = this.newSignal(FleetData,this.myId,this.curLat,this.curLong,this.curSpeed)
        let serialise   = this.lift((fleetData : FleetData)=>{
            //Actual fleet data object is circular (which JSON can't handle)
            return JSON.stringify([fleetData.currentLat,fleetData.currentLong,fleetData.currentSpeed,fleetData.memberId])
        })
        let compressed  = serialise(this.dataSignal)
        let topic       = this.newTopic("FleetData")
        this.publish(compressed,topic)
        this.update(10)
    }

    update(i){
        let newLat      = this.getRandom()
        let newLong     = this.getRandom()
        let newSpeed    = this.getRandom()
        this.dataSignal.actualise(newLat,newLong,newSpeed)
        setTimeout(()=>{
            if(i > 0){
                this.update(--i)
            }
        },3000)
    }
}