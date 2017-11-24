var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../../../src/MicroService/MicroService");
const SubTag_1 = require("../../../src/PubSub/SubTag");
var spiders = require("../../../src/spiders");
var dataTag = new SubTag_1.PubSubTag("Data");
var configTag = new SubTag_1.PubSubTag("Config");
var geoTag = new SubTag_1.PubSubTag("Geo");
var drivingTag = new SubTag_1.PubSubTag("Driving");
var dashTag = new SubTag_1.PubSubTag("Dash");
var admitterTag = new SubTag_1.PubSubTag("Admitter");
var csvWriter = require('csv-write-stream');
var fs = require('fs');
var csv = require('fast-csv');
class FleetData extends spiders.Signal {
    constructor() {
        super();
        this.val = 0;
    }
    actualise() {
        this.val += 1;
    }
}
__decorate([
    spiders.mutator
], FleetData.prototype, "actualise", null);
class ConfigService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName) {
        super("127.0.0.1", 8006);
        this.rate = rate / 2;
        this.totalVals = totalVals / 2;
        if (isQPROP) {
            this.QPROP(configTag, [], [dashTag], null);
        }
        else {
            this.SIDUP(configTag, [], admitterTag);
        }
        let sig = this.newSignal(FleetData);
        this.publishSignal(sig);
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(() => {
            this.update(sig);
        }, 2000);
    }
    update(signal) {
        for (var i = 0; i < this.rate; i++) {
            this.totalVals--;
            signal.actualise();
        }
        if (this.totalVals <= 0) {
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
        if (isQPROP) {
            this.QPROP(dataTag, [], [geoTag, drivingTag], null);
        }
        else {
            this.SIDUP(dataTag, [], admitterTag);
        }
        let sig = this.newSignal(FleetData);
        this.publishSignal(sig);
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(() => {
            this.update(sig);
        }, 2000);
    }
    update(signal) {
        for (var i = 0; i < this.rate; i++) {
            this.totalVals--;
            signal.actualise();
        }
        if (this.totalVals <= 0) {
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
        let imp;
        if (isQPROP) {
            imp = this.QPROP(geoTag, [dataTag], [drivingTag, dashTag], null);
        }
        else {
            imp = this.SIDUP(geoTag, [dataTag], admitterTag);
        }
        let last = null;
        let exp = this.lift(([fleetData]) => {
            if (last != null) {
            }
            return fleetData;
        })(imp);
        this.publishSignal(exp);
    }
}
exports.GeoService = GeoService;
class DrivingService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName) {
        super("127.0.0.1", 8003);
        let imp;
        if (isQPROP) {
            imp = this.QPROP(drivingTag, [dataTag, geoTag], [dashTag], null);
        }
        else {
            imp = this.SIDUP(drivingTag, [dataTag, geoTag], admitterTag);
        }
        let exp = this.lift(([data, geo]) => {
            if (data.val != geo.val) {
                console.log("GLITCH IN DRIVING!!!!!");
                console.log("Data: " + data.val + " geo: " + geo.val);
                //process.exit()
            }
            return data;
        })(imp);
        this.publishSignal(exp);
    }
}
exports.DrivingService = DrivingService;
class DashboardService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName) {
        super("127.0.0.1", 8004);
        let imp;
        if (isQPROP) {
            imp = this.QPROP(dashTag, [drivingTag, geoTag, configTag], [], null);
        }
        else {
            imp = this.SIDUP(dashTag, [drivingTag, geoTag, configTag], admitterTag, true);
        }
        let valsReceived = 0;
        let lastConfig;
        this.lift(([driving, geo, config]) => {
            valsReceived++;
            if (config == lastConfig && driving != null) {
                if (driving.val != geo.val) {
                    console.log("GLITCH IN DASHBOARD !!!!");
                    console.log("Driving val: " + driving.val + " geo val: " + geo.val);
                }
            }
            lastConfig = config;
            if (valsReceived == totalVals) {
                console.log("Benchmark done");
            }
        })(imp);
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=TestCase.js.map