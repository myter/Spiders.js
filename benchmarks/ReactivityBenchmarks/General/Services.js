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
var csvWriter = require('csv-write-stream');
var fs = require('fs');
var csv = require('fast-csv');
//PI tags
exports.pi2Tag = new SubTag_1.PubSubTag("2");
exports.pi3Tag = new SubTag_1.PubSubTag("3");
exports.pi4Tag = new SubTag_1.PubSubTag("4");
exports.pi5Tag = new SubTag_1.PubSubTag("5");
exports.pi6Tag = new SubTag_1.PubSubTag("6");
exports.pi7Tag = new SubTag_1.PubSubTag("7");
exports.pi8Tag = new SubTag_1.PubSubTag("8");
exports.pi9Tag = new SubTag_1.PubSubTag("9");
exports.pi10Tag = new SubTag_1.PubSubTag("10");
exports.pi11Tag = new SubTag_1.PubSubTag("11");
exports.pi12Tag = new SubTag_1.PubSubTag("12");
exports.pi13Tag = new SubTag_1.PubSubTag("13");
exports.pi14Tag = new SubTag_1.PubSubTag("14");
exports.pi15Tag = new SubTag_1.PubSubTag("15");
exports.pi16Tag = new SubTag_1.PubSubTag("16");
exports.pi17Tag = new SubTag_1.PubSubTag("17");
exports.pi18Tag = new SubTag_1.PubSubTag("18");
exports.pi19Tag = new SubTag_1.PubSubTag("19");
exports.pi20Tag = new SubTag_1.PubSubTag("20");
exports.pi21Tag = new SubTag_1.PubSubTag("21");
exports.pi22Tag = new SubTag_1.PubSubTag("22");
exports.pi23Tag = new SubTag_1.PubSubTag("23");
exports.pi24Tag = new SubTag_1.PubSubTag("24");
exports.pi25Tag = new SubTag_1.PubSubTag("25");
exports.pi26Tag = new SubTag_1.PubSubTag("26");
exports.pi27Tag = new SubTag_1.PubSubTag("27");
exports.pi28Tag = new SubTag_1.PubSubTag("28");
exports.pi29Tag = new SubTag_1.PubSubTag("29");
exports.pi30Tag = new SubTag_1.PubSubTag("30");
exports.pi31Tag = new SubTag_1.PubSubTag("31");
exports.pi32Tag = new SubTag_1.PubSubTag("32");
exports.pi33Tag = new SubTag_1.PubSubTag("33");
exports.pi34Tag = new SubTag_1.PubSubTag("34");
exports.pi35Tag = new SubTag_1.PubSubTag("35");
exports.pi36Tag = new SubTag_1.PubSubTag("36");
exports.pi37Tag = new SubTag_1.PubSubTag("37");
exports.pi38Tag = new SubTag_1.PubSubTag("38");
exports.pi39Tag = new SubTag_1.PubSubTag("39");
exports.pi40Tag = new SubTag_1.PubSubTag("40");
exports.pi41Tag = new SubTag_1.PubSubTag("41");
exports.pi42Tag = new SubTag_1.PubSubTag("42");
exports.pi43Tag = new SubTag_1.PubSubTag("43");
exports.pi44Tag = new SubTag_1.PubSubTag("44");
exports.pi45Tag = new SubTag_1.PubSubTag("45");
exports.pi46Tag = new SubTag_1.PubSubTag("46");
exports.pi47Tag = new SubTag_1.PubSubTag("47");
exports.pi48Tag = new SubTag_1.PubSubTag("48");
exports.pi49Tag = new SubTag_1.PubSubTag("49");
exports.pi50Tag = new SubTag_1.PubSubTag("50");
exports.pi51Tag = new SubTag_1.PubSubTag("51");
exports.pi52Tag = new SubTag_1.PubSubTag("52");
exports.pi53Tag = new SubTag_1.PubSubTag("53");
exports.pi54Tag = new SubTag_1.PubSubTag("54");
exports.pi55Tag = new SubTag_1.PubSubTag("55");
exports.pi56Tag = new SubTag_1.PubSubTag("56");
exports.pi57Tag = new SubTag_1.PubSubTag("57");
exports.pi58Tag = new SubTag_1.PubSubTag("58");
exports.pi59Tag = new SubTag_1.PubSubTag("59");
exports.admitterTag = new SubTag_1.PubSubTag("Admitter");
//PI tags
exports.monitorId = 0;
exports.monitorIP = "127.0.0.1";
exports.monitorPort = 8000;
exports.admitterId = 1;
exports.admitterIP = "127.0.0.1";
exports.admitterPort = 8001;
exports.piIds = [];
for (var i = 2; i < 60; i++) {
    exports.piIds.push(i);
}
exports.piAddresses = exports.piIds.map((id, index) => {
    //TODO find out real IP addresses
    return "127.0.0.1";
});
//TODO temp, this is to be removed when benchmark are run for real
let base = 8002;
exports.piPorts = exports.piIds.map((id, index) => {
    return base + index;
});
class PropagationValue extends spiders.Signal {
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
], PropagationValue.prototype, "actualise", null);
exports.PropagationValue = PropagationValue;
class ServiceInfo {
    constructor(tag, parents, children, address, port) {
        this.tag = tag;
        this.parents = parents;
        this.children = children;
        this.address = address;
        this.port = port;
    }
}
exports.ServiceInfo = ServiceInfo;
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
        writer.pipe(fs.createWriteStream(writeTo + dataRate + ".csv", { flags: 'a' }));
        writer.write({ avg: avg });
        writer.end();
    });
    stream.pipe(csvStream);
}
function mapToName(piHostName) {
    //TODO map names
    return piHostName;
}
exports.mapToName = mapToName;
//TODO FOR ALL !!! NEED to explicitly connect to PS server this time (construction argument)
class Admitter extends MicroService_1.MicroServiceApp {
    constructor(totalVals, csvFileName, dataRate, numSources) {
        super(exports.admitterIP, exports.admitterPort, exports.monitorIP, exports.monitorPort);
        let change = (newValue) => {
            let propagationTime = Date.now();
            newValue.constructionTime = propagationTime;
            return newValue;
        };
        this.SIDUPAdmitter(exports.admitterTag, numSources, 1, () => { }, change);
    }
}
exports.Admitter = Admitter;
class SourceService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName, myAddress, myPort, myTag, directParentsTags, directChildrenTags) {
        super(myAddress, myPort, exports.monitorIP, exports.monitorPort);
        this.rate = rate;
        this.totalVals = totalVals;
        this.csvFileName = csvFileName;
        if (isQPROP) {
            this.QPROP(myTag, directParentsTags, directChildrenTags, null);
        }
        else {
            this.SIDUP(myTag, directParentsTags, exports.admitterTag);
        }
        let sig = this.newSignal(PropagationValue);
        this.publishSignal(sig);
        //Wait for construction to be completed (for both QPROP and SIDUP)
        setTimeout(() => {
            this.update(sig);
        }, 5000);
    }
    update(signal) {
        for (var i = 0; i < this.rate; i++) {
            this.totalVals--;
            signal.actualise();
        }
        if (this.totalVals > 0) {
            setTimeout(() => {
                this.update(signal);
            }, 1000);
        }
    }
}
exports.SourceService = SourceService;
class DerivedService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName, myAddress, myPort, myTag, directParentsTag, directChildrenTags) {
        super(myAddress, myPort, exports.monitorIP, exports.monitorPort);
        let imp;
        if (isQPROP) {
            imp = this.QPROP(myTag, directParentsTag, directChildrenTags, null);
        }
        else {
            imp = this.SIDUP(myTag, directParentsTag, exports.admitterTag);
        }
        let firstPropagation = true;
        let lastArgs;
        let exp = this.lift((args) => {
            if (firstPropagation) {
                firstPropagation = false;
                lastArgs = args;
                let ret;
                args.forEach((v) => {
                    if (v) {
                        ret = v;
                    }
                });
                return ret;
            }
            else {
                let newV;
                args.some((v, index) => {
                    if (lastArgs[index] != v && v != undefined && v != null) {
                        newV = v;
                        return true;
                    }
                });
                lastArgs = args;
                return newV;
            }
        })(imp);
        this.publishSignal(exp);
    }
}
exports.DerivedService = DerivedService;
class SinkService extends MicroService_1.MicroServiceApp {
    constructor(isQPROP, rate, totalVals, csvFileName, myAddress, myPort, myTag, directParentTags, directChildrenTags, numSources) {
        super(myAddress, myPort, exports.monitorIP, exports.monitorPort);
        let valsReceived = 0;
        let writer = csvWriter({ headers: ["TTP"] });
        let tWriter = csvWriter({ sendHeaders: false });
        writer.pipe(fs.createWriteStream('temp.csv'));
        tWriter.pipe(fs.createWriteStream("Throughput" + csvFileName + rate + ".csv", { flags: 'a' }));
        let imp;
        if (isQPROP) {
            imp = this.QPROP(myTag, directParentTags, directChildrenTags, null);
        }
        else {
            imp = this.SIDUP(myTag, directParentTags, exports.admitterTag, true);
        }
        let lastArgs;
        let firstPropagation = true;
        let benchStart;
        this.lift((args) => {
            let timeToPropagate;
            if (firstPropagation) {
                benchStart = Date.now();
                firstPropagation = false;
                lastArgs = args;
                args.forEach((v) => {
                    if (v) {
                        timeToPropagate = Date.now() - v.constructionTime;
                    }
                });
            }
            else {
                let newV;
                args.some((v, index) => {
                    if (lastArgs[index] != v && v != undefined && v != null) {
                        newV = v;
                        return true;
                    }
                });
                timeToPropagate = Date.now() - newV.constructionTime;
            }
            lastArgs = args;
            valsReceived++;
            console.log("Values propagated: " + valsReceived);
            writer.write([timeToPropagate]);
            if (valsReceived == totalVals * numSources) {
                console.log("Benchmark Finished");
                writer.end();
                let benchStop = Date.now();
                tWriter.write({ time: (benchStop - benchStart), values: totalVals });
                tWriter.end();
                averageResults(csvFileName, rate);
            }
        })(imp);
    }
}
exports.SinkService = SinkService;
//# sourceMappingURL=Services.js.map