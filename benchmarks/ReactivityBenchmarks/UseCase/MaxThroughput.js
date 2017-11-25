var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../../../src/MicroService/MicroService");
const SubTag_1 = require("../../../src/PubSub/SubTag");
const ServiceMonitor_1 = require("../../../src/MicroService/ServiceMonitor");
var spiders = require("../../../src/spiders");
var dataTag = new SubTag_1.PubSubTag("Data");
var configTag = new SubTag_1.PubSubTag("Config");
var geoTag = new SubTag_1.PubSubTag("Geo");
var drivingTag = new SubTag_1.PubSubTag("Driving");
var dashTag = new SubTag_1.PubSubTag("Dash");
var csvWriter = require('csv-write-stream');
var fs = require('fs');
var csv = require('fast-csv');
class FleetData extends spiders.Signal {
    constructor() {
        super();
        this.constructionTime = Date.now();
    }
    actualise() {
        this.constructionTime = Date.now();
    }
}
__decorate([
    spiders.mutator
], FleetData.prototype, "actualise", null);
function averageResults(writeTo, dataRate) {
    var stream = fs.createReadStream('temp.csv');
    let length = 0;
    let total = 0;
    let header = true;
    var csvStream = csv()
        .on("data", function (data) {
        if (!header) {
            length++;
            total += parseInt(data);
        }
        header = false;
    })
        .on("end", function () {
        let avg = total / length;
        let writer = csvWriter({ sendHeaders: false });
        writer.pipe(fs.createWriteStream("Latency/" + writeTo + dataRate + ".csv", { flags: 'a' }));
        writer.write({ avg: avg });
        writer.end();
    });
    stream.pipe(csvStream);
}
class ConfigService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName) {
        super("127.0.0.1", 8006);
        this.rate = rate / 2;
        this.totalVals = totalVals / 2;
        this.csvFileName = csvFileName;
        this.produced = 0;
        this.QPROP(configTag, [], [dashTag], null);
        let sig = this.newSignal(FleetData);
        this.publishSignal(sig);
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(() => {
            this.update(sig);
        }, 2000);
    }
    update(signal) {
        for (var i = 0; i < this.rate; i++) {
            this.produced++;
            signal.actualise();
        }
        console.log("Produced by config : " + this.produced);
        if (this.produced == 2 * this.totalVals) {
            console.log("STOPPING CONFIG");
        }
        else {
            setTimeout(() => {
                this.update(signal);
            }, 1000);
        }
    }
}
exports.ConfigService = ConfigService;
class DataAccessService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName) {
        super("127.0.0.1", 8001);
        this.rate = rate / 2;
        this.totalVals = totalVals / 2;
        this.csvFileName = csvFileName;
        this.produced = 0;
        this.QPROP(dataTag, [], [geoTag, drivingTag], null);
        let sig = this.newSignal(FleetData);
        this.publishSignal(sig);
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(() => {
            this.update(sig);
        }, 2000);
    }
    update(signal) {
        for (var i = 0; i < this.rate; i++) {
            this.produced++;
            signal.actualise();
        }
        console.log("Produced by data: " + this.produced);
        if (this.produced == 2 * this.totalVals) {
            console.log("STOPPING DATA");
        }
        else {
            setTimeout(() => {
                this.update(signal);
            }, 1000);
        }
    }
}
exports.DataAccessService = DataAccessService;
class GeoService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName) {
        super("127.0.0.1", 8002);
        let imp = this.QPROP(geoTag, [dataTag], [drivingTag, dashTag], null);
        let propagated = 0;
        let exp = this.lift(([fleetData]) => {
            propagated++;
            return fleetData;
        })(imp);
        this.publishSignal(exp);
    }
}
exports.GeoService = GeoService;
class DrivingService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName) {
        super("127.0.0.1", 8003);
        let imp = this.QPROP(drivingTag, [dataTag, geoTag], [dashTag], null);
        let propagated = 0;
        let exp = this.lift(([data, geo]) => {
            propagated++;
            return data;
        })(imp);
        this.publishSignal(exp);
    }
}
exports.DrivingService = DrivingService;
class DashboardService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName) {
        super("127.0.0.1", 8004);
        let valsReceived = 0;
        let writer = csvWriter({ headers: ["TTP"] });
        let tWriter = csvWriter({ sendHeaders: false });
        let pWriter = csvWriter({ sendHeaders: false });
        writer.pipe(fs.createWriteStream('temp.csv'));
        tWriter.pipe(fs.createWriteStream("Throughput/" + csvFileName + rate + ".csv", { flags: 'a' }));
        pWriter.pipe(fs.createWriteStream("Processing/" + csvFileName + rate + ".csv", { flags: 'a' }));
        let imp = this.QPROP(dashTag, [drivingTag, geoTag, configTag], [], null);
        let lastDriving;
        let lastConfig;
        let firstPropagation = true;
        let benchStart;
        let processingTimes = [];
        this.lift(([driving, geo, config]) => {
            if (firstPropagation) {
                benchStart = Date.now();
                firstPropagation = false;
            }
            let timeToPropagate;
            if (lastDriving != driving) {
                timeToPropagate = Date.now() - driving.constructionTime;
            }
            else {
                timeToPropagate = Date.now() - config.constructionTime;
            }
            lastDriving = driving;
            lastConfig = config;
            valsReceived++;
            //console.log("Values propagated: " + valsReceived)
            if (valsReceived.toString().endsWith("000")) {
                console.log("Values propagated: " + valsReceived);
            }
            writer.write([timeToPropagate]);
            processingTimes.push(timeToPropagate);
            if (valsReceived == totalVals) {
                console.log("Benchmark Finished");
                writer.end();
                let benchStop = Date.now();
                tWriter.write({ time: (benchStop - benchStart), values: totalVals });
                tWriter.end();
                if (isQPROP) {
                    let total = 0;
                    processingTimes.forEach((pTime) => {
                        total += pTime;
                    });
                    let avg = total / processingTimes.length;
                    pWriter.write({ pTime: avg });
                    pWriter.end();
                }
                averageResults(csvFileName, rate);
            }
        })(imp);
    }
}
exports.DashboardService = DashboardService;
let isQPROP = process.argv[2] == "true";
let toSpawn = process.argv[3];
let dataRate = parseInt(process.argv[4]);
let totalVals = dataRate * 30;
let csvFile = process.argv[5];
switch (toSpawn) {
    case "monitor":
        new ServiceMonitor_1.ServiceMonitor();
        break;
    case "data":
        new DataAccessService(isQPROP, dataRate, totalVals, csvFile);
        break;
    case "config":
        new ConfigService(isQPROP, dataRate, totalVals, csvFile);
        break;
    case "driving":
        new DrivingService(isQPROP, dataRate, totalVals, csvFile);
        break;
    case "geo":
        new GeoService(isQPROP, dataRate, totalVals, csvFile);
        break;
    case "dash":
        new DashboardService(isQPROP, dataRate, totalVals, csvFile);
        break;
    default:
        throw new Error("unknown spawning argument");
}
//# sourceMappingURL=MaxThroughput.js.map