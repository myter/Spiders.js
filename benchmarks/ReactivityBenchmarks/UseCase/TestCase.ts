import {SpiderLib} from "../../../src/spiders";
import {MicroServiceApp} from "../../../src/MicroService/MicroService";
import {PubSubTag} from "../../../src/PubSub/SubTag";

var spiders : SpiderLib = require("../../../src/spiders")
var dataTag             = new PubSubTag("Data")
var configTag           = new PubSubTag("Config")
var geoTag              = new PubSubTag("Geo")
var drivingTag          = new PubSubTag("Driving")
var dashTag             = new PubSubTag("Dash")
var admitterTag        = new PubSubTag("Admitter")
var csvWriter = require('csv-write-stream')
var fs = require('fs')
var csv = require('fast-csv')

class FleetData extends spiders.Signal{
    val

    constructor(){
        super()
        this.val = 0
    }

    @spiders.mutator
    actualise(){
        this.val += 1
    }
}









export class ConfigService extends MicroServiceApp{
    rate
    totalVals
    memWriter
    csvFileName

    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8006)
        this.rate = rate / 2
        this.totalVals = totalVals / 2
        if(isQPROP){
            this.QPROP(configTag,[],[dashTag],null)
        }
        else{
            this.SIDUP(configTag,[],admitterTag)
        }
        let sig = this.newSignal(FleetData)

        this.publishSignal(sig)
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(()=>{
            this.update(sig)
        },2000)
    }

    update(signal){
        for(var i = 0;i < this.rate;i++){
            this.totalVals--
            signal.actualise()
        }
        if(this.totalVals <= 0){
        }
        else{
            setTimeout(()=>{
                this.update(signal)
            },1000)
        }
    }
}

export class DataAccessService extends MicroServiceApp{
    rate
    totalVals
    memWriter
    csvFileName

    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8001)
        this.rate = rate / 2
        this.totalVals = totalVals / 2
        if(isQPROP){
            this.QPROP(dataTag,[],[geoTag,drivingTag],null)
        }
        else{
            this.SIDUP(dataTag,[],admitterTag)
        }
        let sig = this.newSignal(FleetData)

        this.publishSignal(sig)
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(()=>{
            this.update(sig)
        },2000)
    }

    update(signal){
        for(var i = 0;i < this.rate;i++){
            this.totalVals--
            signal.actualise()
        }
        if(this.totalVals <= 0){
        }
        else{
            setTimeout(()=>{
                this.update(signal)
            },1000)
        }
    }
}

export class GeoService extends MicroServiceApp{
    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8002)
        let imp
        if(isQPROP){
            imp = this.QPROP(geoTag,[dataTag],[drivingTag,dashTag],null)
        }
        else{
            imp = this.SIDUP(geoTag,[dataTag],admitterTag)
        }
        let last = null
        let exp = this.lift(([fleetData])=>{
            if(last != null){

            }
            return fleetData
        })(imp)
        this.publishSignal(exp)
    }
}

export class DrivingService extends MicroServiceApp{
    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8003)
        let imp
        if(isQPROP){
            imp = this.QPROP(drivingTag,[dataTag,geoTag],[dashTag],null)
        }
        else{
            imp = this.SIDUP(drivingTag,[dataTag,geoTag],admitterTag)
        }
        let exp = this.lift(([data,geo])=>{
            if(data.val != geo.val){
                console.log("GLITCH IN DRIVING!!!!!")
                console.log("Data: " + data.val + " geo: " + geo.val)
                //process.exit()
            }
            return data
        })(imp)
        this.publishSignal(exp)
    }
}

export class DashboardService extends MicroServiceApp{
    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8004)
        let imp
        if(isQPROP){
            imp = this.QPROP(dashTag,[drivingTag,geoTag,configTag],[],null)
        }
        else{
            imp = this.SIDUP(dashTag,[drivingTag,geoTag,configTag],admitterTag,true)
        }
        let valsReceived = 0
        let lastConfig
        this.lift(([driving,geo,config])=>{
            valsReceived++
            if(config == lastConfig && driving != null){
                if(driving.val != geo.val){
                    console.log("GLITCH IN DASHBOARD !!!!")
                    console.log("Driving val: " + driving.val + " geo val: " + geo.val)
                }
            }
            lastConfig = config
            if(valsReceived == totalVals){
                console.log("Benchmark done")
            }
        })(imp)
    }
}