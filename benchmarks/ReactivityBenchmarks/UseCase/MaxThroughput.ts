import {SpiderLib} from "../../../src/spiders";
import {MicroServiceApp} from "../../../src/MicroService/MicroService";
import {PubSubTag} from "../../../src/PubSub/SubTag";
import {ServiceMonitor} from "../../../src/MicroService/ServiceMonitor";

var spiders : SpiderLib = require("../../../src/spiders")
var dataTag             = new PubSubTag("Data")
var configTag           = new PubSubTag("Config")
var geoTag              = new PubSubTag("Geo")
var drivingTag          = new PubSubTag("Driving")
var dashTag             = new PubSubTag("Dash")
var csvWriter = require('csv-write-stream')
var fs = require('fs')
var csv = require('fast-csv')

class FleetData extends spiders.Signal{
    constructionTime

    constructor(){
        super()
        this.constructionTime = Date.now()
    }

    @spiders.mutator
    actualise(){
        this.constructionTime = Date.now()
    }
}

function averageResults(writeTo,dataRate){
    var stream          = fs.createReadStream('temp.csv');
    let length          = 0
    let total           = 0
    let header          = true
    var csvStream = csv()
        .on("data", function(data){
            if(!header){
                length++
                total += parseInt(data)
            }
            header = false
        })
        .on("end", function(){
            let avg = total / length
            let writer = csvWriter({sendHeaders: false})
            writer.pipe(fs.createWriteStream("Latency/"+writeTo+dataRate+".csv",{flags: 'a'}))
            writer.write({avg: avg})
            writer.end()
        });
    stream.pipe(csvStream)
}

export class ConfigService extends MicroServiceApp{
    rate
    totalVals
    csvFileName
    produced

    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8006)
        this.rate = rate / 2
        this.totalVals = totalVals / 2
        this.csvFileName = csvFileName
        this.produced = 0
        this.QPROP(configTag,[],[dashTag],null)
        let sig = this.newSignal(FleetData)

        this.publishSignal(sig)
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(()=>{
            this.update(sig)
        },2000)
    }

    update(signal){
        for(var i = 0;i < this.rate;i++){
            this.produced++
            signal.actualise()
        }
        setTimeout(()=>{
            this.update(signal)
        },1000)
    }
}

export class DataAccessService extends MicroServiceApp{
    rate
    totalVals
    csvFileName
    produced

    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8001)
        this.rate = rate / 2
        this.totalVals = totalVals / 2
        this.csvFileName = csvFileName
        this.produced = 0
        this.QPROP(dataTag,[],[geoTag,drivingTag],null)
        let sig = this.newSignal(FleetData)

        this.publishSignal(sig)
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(()=>{
            this.update(sig)
        },2000)
    }

    update(signal){
        for(var i = 0;i < this.rate;i++){
            this.produced++
            signal.actualise()
        }
        setTimeout(()=>{
            this.update(signal)
        },1000)
    }
}

export class GeoService extends MicroServiceApp{
    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8002)
        let imp = this.QPROP(geoTag,[dataTag],[drivingTag,dashTag],null)
        let propagated = 0
        let exp = this.lift(([fleetData])=>{
            propagated++
            return fleetData
        })(imp)
        this.publishSignal(exp)
    }
}

export class DrivingService extends MicroServiceApp{
    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8003)
        let imp = this.QPROP(drivingTag,[dataTag,geoTag],[dashTag],null)
        let propagated = 0
        let exp = this.lift(([data,geo])=>{
            propagated++
            return data
        })(imp)
        this.publishSignal(exp)
    }
}

export class DashboardService extends MicroServiceApp{
    constructor(isQPROP,rate,totalVals,csvFileName){
        super("127.0.0.1",8004)
        let valsReceived = 0
        let writer = csvWriter({headers: ["TTP"]})
        let tWriter = csvWriter({sendHeaders: false})
        let pWriter = csvWriter({sendHeaders: false})
        writer.pipe(fs.createWriteStream('temp.csv'))
        tWriter.pipe(fs.createWriteStream("Throughput/"+csvFileName+rate+".csv",{flags: 'a'}))
        pWriter.pipe(fs.createWriteStream("Processing/"+csvFileName+rate+".csv",{flags: 'a'}))
        let imp= this.QPROP(dashTag,[drivingTag,geoTag,configTag],[],null)
        let lastDriving
        let lastConfig
        let firstPropagation = true
        let benchStart
        let processingTimes = []
        this.lift(([driving,geo,config])=>{
            if(firstPropagation){
                benchStart = Date.now()
                firstPropagation = false
            }
            let timeToPropagate
            if(lastDriving != driving){
                timeToPropagate = Date.now() - driving.constructionTime
            }
            else{
                timeToPropagate = Date.now() - config.constructionTime
            }
            lastDriving = driving
            lastConfig  = config
            valsReceived++
            //console.log("Values propagated: " + valsReceived)
            if(valsReceived.toString().endsWith("000")){
                console.log("Values propagated: " + valsReceived)
            }
            writer.write([timeToPropagate])
            processingTimes.push(timeToPropagate)
            if(valsReceived == totalVals){
                console.log("Benchmark Finished")
                writer.end()
                let benchStop = Date.now()
                tWriter.write({time: (benchStop - benchStart),values: totalVals})
                tWriter.end()
                if(isQPROP){
                    let total = 0
                    processingTimes.forEach((pTime)=>{
                        total += pTime
                    })
                    let avg = total / processingTimes.length
                    pWriter.write({pTime: avg})
                    pWriter.end()
                }
                averageResults(csvFileName,rate)
                require('child_process').exec("killall node");
            }
        })(imp)
    }
}

let isQPROP     = process.argv[2] == "true"
let toSpawn     = process.argv[3]
let dataRate    = parseInt(process.argv[4])
let totalVals   = dataRate * 30
let csvFile     = process.argv[5]
switch (toSpawn){
    case "monitor":
        new ServiceMonitor()
        break
    case "data":
        new DataAccessService(isQPROP,dataRate,totalVals,csvFile)
        break
    case "config":
        new ConfigService(isQPROP,dataRate,totalVals,csvFile)
        break
    case "driving":
        new DrivingService(isQPROP,dataRate,totalVals,csvFile)
        break
    case "geo":
        new GeoService(isQPROP,dataRate,totalVals,csvFile)
        break
    case "dash":
        new DashboardService(isQPROP,dataRate,totalVals,csvFile)
        break
    default:
        throw new Error("unknown spawning argument")
}