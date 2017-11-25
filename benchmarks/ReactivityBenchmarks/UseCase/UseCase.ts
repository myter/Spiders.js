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

function averageMem(writeTo,dataRate,node,kill){
    var stream          = fs.createReadStream('temp'+node+"Memory.csv");
    let length          = 0
    let totalHeap       = 0
    let totalRss        = 0
    var csvStream = csv()
        .on("data", function(data){
            length++
            totalHeap += parseInt(data[0])
            totalRss  += parseInt(data[1])
        })
        .on("end", function(){
            let avgHeap = totalHeap / length
            let avgRss  = totalRss / length
            let writer = csvWriter({sendHeaders: false})
            writer.pipe(fs.createWriteStream("Memory/"+writeTo+dataRate+node+"Memory.csv",{flags: 'a'}))
            writer.write({heap: avgHeap,rss:avgRss})
            writer.end()
            if(kill){
                require('child_process').exec("killall node");
            }
        });
    stream.pipe(csvStream)
}

class MemoryWriter{
    writer

    constructor(node){
        this.writer = csvWriter({sendHeaders: false})
        this.writer.pipe(fs.createWriteStream("temp"+node+"Memory.csv"))
    }

    snapshot(){
        let mem = process.memoryUsage()
        this.writer.write({heap:mem.heapUsed,rss:mem.rss})
    }

    end(){
        this.writer.end()
    }
}

export class Admitter extends MicroServiceApp{
    constructor(totalVals,csvFileName,dataRate){
        super("127.0.0.1",8005)
        let writer = csvWriter({ sendHeaders: false})
        writer.pipe(fs.createWriteStream("Processing/"+csvFileName+dataRate+".csv",{flags: 'a'}))
        let memWriter = new MemoryWriter("Admitter")
        let valsReceived = -1
        let change = (newValue) => {
            memWriter.snapshot()
            let propagationTime = Date.now()
            newValue.constructionTime = propagationTime
            return newValue
        }
        let admitTimes = []
        let processTimes = []
        let idle = ()=>{
            valsReceived++
            if(valsReceived > 0){
                let processTime = Date.now() - (admitTimes.splice(0,1)[0])
                processTimes.push(processTime)
                if(valsReceived == totalVals){
                    let total = 0
                    processTimes.forEach((pTime)=>{
                        total += pTime
                    })
                    let avg = total / processTimes.length
                    writer.write({pTime: avg})
                    writer.end()
                    require('child_process').exec("killall node");
                }
            }
        }
        let admit = ()=>{
            admitTimes.push(Date.now())
        }
        this.SIDUPAdmitter(admitterTag,2,1,idle,change,admit)
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
        this.memWriter = new MemoryWriter("Config")
        this.csvFileName = csvFileName
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
        this.memWriter.snapshot()
        for(var i = 0;i < this.rate;i++){
            this.totalVals--
            signal.actualise()
        }
        //Memory not measured for max throughput benchmarks
        if(this.totalVals <= 0 && this.rate <= 300){
            this.memWriter.end()
            averageMem(this.csvFileName,this.rate*2,"Config",false)
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
        this.memWriter = new MemoryWriter("Data")
        this.csvFileName = csvFileName
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
        this.memWriter.snapshot()
        for(var i = 0;i < this.rate;i++){
            this.totalVals--
            signal.actualise()
        }
        if(this.totalVals <= 0 && this.rate <= 300){
            this.memWriter.end()
            averageMem(this.csvFileName,this.rate*2,"Data",false)
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
        let propagated = 0
        let memWriter = new MemoryWriter("Geo")
        let exp = this.lift(([fleetData])=>{
            propagated++
            memWriter.snapshot()
            if(propagated == totalVals / 2){
                memWriter.end()
                averageMem(csvFileName,rate,"Geo",false)
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
        let propagated = 0
        let memWriter = new MemoryWriter("Driving")
        let exp = this.lift(([data,geo])=>{
            propagated++
            memWriter.snapshot()
            if(propagated == totalVals / 2){
                memWriter.end()
                averageMem(csvFileName,rate,"Driving",false)
            }
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
        let imp
        if(isQPROP){
            imp = this.QPROP(dashTag,[drivingTag,geoTag,configTag],[],null)
        }
        else{
            imp = this.SIDUP(dashTag,[drivingTag,geoTag,configTag],admitterTag,true)
        }
        let memWriter = new MemoryWriter("Dashboard")
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
            memWriter.snapshot()
            console.log("Values propagated: " + valsReceived)
            writer.write([timeToPropagate])
            processingTimes.push(timeToPropagate)
            if(valsReceived == totalVals){
                console.log("Benchmark Finished")
                writer.end()
                memWriter.end()
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
                averageMem(csvFileName,rate,"Dashboard",isQPROP)
            }
        })(imp)
    }
}