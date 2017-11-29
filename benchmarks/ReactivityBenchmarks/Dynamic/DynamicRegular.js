Object.defineProperty(exports, "__esModule", { value: true });
const DynamicServices_1 = require("./DynamicServices");
const ServiceMonitor_1 = require("../../../src/MicroService/ServiceMonitor");
var pi2 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi2Tag, [], [DynamicServices_1.pi12Tag], DynamicServices_1.piAddresses[0], DynamicServices_1.piPorts[0]);
var pi3 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi3Tag, [], [DynamicServices_1.pi12Tag], DynamicServices_1.piAddresses[1], DynamicServices_1.piPorts[1]);
var pi4 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi4Tag, [], [DynamicServices_1.pi13Tag, DynamicServices_1.pi15Tag], DynamicServices_1.piAddresses[2], DynamicServices_1.piPorts[2]);
var pi5 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi5Tag, [], [DynamicServices_1.pi14Tag], DynamicServices_1.piAddresses[3], DynamicServices_1.piPorts[3]);
var pi6 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi6Tag, [], [DynamicServices_1.pi13Tag, DynamicServices_1.pi15Tag], DynamicServices_1.piAddresses[4], DynamicServices_1.piPorts[4]);
var pi7 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi7Tag, [], [DynamicServices_1.pi16Tag], DynamicServices_1.piAddresses[5], DynamicServices_1.piPorts[5]);
var pi8 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi8Tag, [], [DynamicServices_1.pi16Tag], DynamicServices_1.piAddresses[6], DynamicServices_1.piPorts[6]);
var pi9 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi9Tag, [], [DynamicServices_1.pi16Tag, DynamicServices_1.pi17Tag, DynamicServices_1.pi18Tag], DynamicServices_1.piAddresses[7], DynamicServices_1.piPorts[7]);
var pi10 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi10Tag, [], [DynamicServices_1.pi19Tag, DynamicServices_1.pi20Tag], DynamicServices_1.piAddresses[8], DynamicServices_1.piPorts[8]);
var pi11 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi11Tag, [], [DynamicServices_1.pi19Tag, DynamicServices_1.pi20Tag], DynamicServices_1.piAddresses[9], DynamicServices_1.piPorts[9]);
var pi12 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi12Tag, [DynamicServices_1.pi2Tag, DynamicServices_1.pi3Tag], [DynamicServices_1.pi21Tag, DynamicServices_1.pi23Tag], DynamicServices_1.piAddresses[10], DynamicServices_1.piPorts[10]);
var pi13 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi13Tag, [DynamicServices_1.pi4Tag, DynamicServices_1.pi6Tag], [DynamicServices_1.pi22Tag], DynamicServices_1.piAddresses[11], DynamicServices_1.piPorts[11]);
var pi14 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi14Tag, [DynamicServices_1.pi5Tag], [DynamicServices_1.pi21Tag, DynamicServices_1.pi22Tag], DynamicServices_1.piAddresses[12], DynamicServices_1.piPorts[12]);
var pi15 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi15Tag, [DynamicServices_1.pi4Tag, DynamicServices_1.pi6Tag], [DynamicServices_1.pi23Tag, DynamicServices_1.pi24Tag], DynamicServices_1.piAddresses[13], DynamicServices_1.piPorts[13]);
var pi16 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi16Tag, [DynamicServices_1.pi7Tag, DynamicServices_1.pi8Tag, DynamicServices_1.pi9Tag], [DynamicServices_1.pi24Tag, DynamicServices_1.pi25Tag, DynamicServices_1.pi26Tag], DynamicServices_1.piAddresses[14], DynamicServices_1.piPorts[14]);
var pi17 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi17Tag, [DynamicServices_1.pi9Tag], [DynamicServices_1.pi26Tag, DynamicServices_1.pi27Tag], DynamicServices_1.piAddresses[15], DynamicServices_1.piPorts[15]);
var pi18 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi18Tag, [DynamicServices_1.pi9Tag], [DynamicServices_1.pi27Tag], DynamicServices_1.piAddresses[16], DynamicServices_1.piPorts[16]);
var pi19 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi19Tag, [DynamicServices_1.pi10Tag, DynamicServices_1.pi11Tag], [DynamicServices_1.pi27Tag, DynamicServices_1.pi28Tag, DynamicServices_1.pi29Tag], DynamicServices_1.piAddresses[17], DynamicServices_1.piPorts[17]);
var pi20 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi20Tag, [DynamicServices_1.pi10Tag, DynamicServices_1.pi11Tag], [DynamicServices_1.pi28Tag], DynamicServices_1.piAddresses[18], DynamicServices_1.piPorts[18]);
var pi21 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi21Tag, [DynamicServices_1.pi12Tag, DynamicServices_1.pi14Tag], [DynamicServices_1.pi30Tag, DynamicServices_1.pi31Tag], DynamicServices_1.piAddresses[19], DynamicServices_1.piPorts[19]);
var pi22 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi22Tag, [DynamicServices_1.pi13Tag, DynamicServices_1.pi14Tag], [DynamicServices_1.pi32Tag], DynamicServices_1.piAddresses[20], DynamicServices_1.piPorts[20]);
var pi23 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi23Tag, [DynamicServices_1.pi12Tag, DynamicServices_1.pi15Tag], [DynamicServices_1.pi33Tag], DynamicServices_1.piAddresses[21], DynamicServices_1.piPorts[21]);
var pi24 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi24Tag, [DynamicServices_1.pi15Tag, DynamicServices_1.pi16Tag], [DynamicServices_1.pi33Tag, DynamicServices_1.pi34Tag], DynamicServices_1.piAddresses[22], DynamicServices_1.piPorts[22]);
var pi25 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi25Tag, [DynamicServices_1.pi16Tag], [DynamicServices_1.pi34Tag], DynamicServices_1.piAddresses[23], DynamicServices_1.piPorts[23]);
var pi26 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi26Tag, [DynamicServices_1.pi16Tag, DynamicServices_1.pi17Tag], [DynamicServices_1.pi35Tag], DynamicServices_1.piAddresses[24], DynamicServices_1.piPorts[24]);
var pi27 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi27Tag, [DynamicServices_1.pi17Tag, DynamicServices_1.pi18Tag, DynamicServices_1.pi19Tag], [DynamicServices_1.pi35Tag, DynamicServices_1.pi36Tag], DynamicServices_1.piAddresses[25], DynamicServices_1.piPorts[25]);
var pi28 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi28Tag, [DynamicServices_1.pi19Tag, DynamicServices_1.pi20Tag], [DynamicServices_1.pi37Tag], DynamicServices_1.piAddresses[26], DynamicServices_1.piPorts[26]);
var pi29 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi29Tag, [DynamicServices_1.pi19Tag], [DynamicServices_1.pi37Tag, DynamicServices_1.pi38Tag], DynamicServices_1.piAddresses[27], DynamicServices_1.piPorts[27]);
var pi30 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi30Tag, [DynamicServices_1.pi21Tag], [DynamicServices_1.pi39Tag, DynamicServices_1.pi40Tag], DynamicServices_1.piAddresses[28], DynamicServices_1.piPorts[28]);
var pi31 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi31Tag, [DynamicServices_1.pi21Tag], [DynamicServices_1.pi39Tag], DynamicServices_1.piAddresses[29], DynamicServices_1.piPorts[29]);
var pi32 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi32Tag, [DynamicServices_1.pi22Tag], [DynamicServices_1.pi41Tag], DynamicServices_1.piAddresses[30], DynamicServices_1.piPorts[30]);
var pi33 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi33Tag, [DynamicServices_1.pi23Tag, DynamicServices_1.pi24Tag], [DynamicServices_1.pi42Tag], DynamicServices_1.piAddresses[31], DynamicServices_1.piPorts[31]);
var pi34 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi34Tag, [DynamicServices_1.pi24Tag, DynamicServices_1.pi25Tag], [DynamicServices_1.pi41Tag, DynamicServices_1.pi43Tag], DynamicServices_1.piAddresses[32], DynamicServices_1.piPorts[32]);
var pi35 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi35Tag, [DynamicServices_1.pi26Tag, DynamicServices_1.pi27Tag], [DynamicServices_1.pi47Tag], DynamicServices_1.piAddresses[33], DynamicServices_1.piPorts[33]);
var pi36 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi36Tag, [DynamicServices_1.pi27Tag], [DynamicServices_1.pi44Tag, DynamicServices_1.pi45Tag], DynamicServices_1.piAddresses[34], DynamicServices_1.piPorts[34]);
var pi37 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi37Tag, [DynamicServices_1.pi28Tag, DynamicServices_1.pi29Tag], [DynamicServices_1.pi46Tag], DynamicServices_1.piAddresses[35], DynamicServices_1.piPorts[35]);
var pi38 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi38Tag, [DynamicServices_1.pi29Tag], [DynamicServices_1.pi44Tag], DynamicServices_1.piAddresses[36], DynamicServices_1.piPorts[36]);
var pi39 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi39Tag, [DynamicServices_1.pi30Tag, DynamicServices_1.pi31Tag], [DynamicServices_1.pi48Tag], DynamicServices_1.piAddresses[37], DynamicServices_1.piPorts[37]);
var pi40 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi40Tag, [DynamicServices_1.pi30Tag], [DynamicServices_1.pi50Tag], DynamicServices_1.piAddresses[38], DynamicServices_1.piPorts[38]);
var pi41 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi41Tag, [DynamicServices_1.pi32Tag, DynamicServices_1.pi34Tag], [DynamicServices_1.pi49Tag], DynamicServices_1.piAddresses[39], DynamicServices_1.piPorts[39]);
var pi42 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi42Tag, [DynamicServices_1.pi33Tag], [DynamicServices_1.pi50Tag, DynamicServices_1.pi55Tag], DynamicServices_1.piAddresses[40], DynamicServices_1.piPorts[40]);
var pi43 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi43Tag, [DynamicServices_1.pi34Tag], [DynamicServices_1.pi51Tag], DynamicServices_1.piAddresses[41], DynamicServices_1.piPorts[41]);
var pi44 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi44Tag, [DynamicServices_1.pi36Tag, DynamicServices_1.pi38Tag], [DynamicServices_1.pi52Tag, DynamicServices_1.pi54Tag], DynamicServices_1.piAddresses[42], DynamicServices_1.piPorts[42]);
var pi45 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi45Tag, [DynamicServices_1.pi36Tag], [DynamicServices_1.pi53Tag], DynamicServices_1.piAddresses[43], DynamicServices_1.piPorts[43]);
var pi46 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi46Tag, [DynamicServices_1.pi37Tag], [DynamicServices_1.pi53Tag], DynamicServices_1.piAddresses[44], DynamicServices_1.piPorts[44]);
var pi47 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi47Tag, [DynamicServices_1.pi35Tag], [DynamicServices_1.pi54Tag], DynamicServices_1.piAddresses[45], DynamicServices_1.piPorts[45]);
var pi48 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi48Tag, [DynamicServices_1.pi39Tag], [DynamicServices_1.pi57Tag], DynamicServices_1.piAddresses[46], DynamicServices_1.piPorts[46]);
var pi49 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi49Tag, [DynamicServices_1.pi41Tag], [DynamicServices_1.pi56Tag], DynamicServices_1.piAddresses[47], DynamicServices_1.piPorts[47]);
var pi50 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi50Tag, [DynamicServices_1.pi40Tag, DynamicServices_1.pi42Tag], [DynamicServices_1.pi57Tag], DynamicServices_1.piAddresses[48], DynamicServices_1.piPorts[48]);
var pi51 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi51Tag, [DynamicServices_1.pi43Tag], [DynamicServices_1.pi56Tag], DynamicServices_1.piAddresses[49], DynamicServices_1.piPorts[49]);
var pi52 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi52Tag, [DynamicServices_1.pi44Tag], [DynamicServices_1.pi56Tag], DynamicServices_1.piAddresses[50], DynamicServices_1.piPorts[50]);
var pi53 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi53Tag, [DynamicServices_1.pi45Tag, DynamicServices_1.pi46Tag], [DynamicServices_1.pi58Tag], DynamicServices_1.piAddresses[51], DynamicServices_1.piPorts[51]);
var pi54 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi54Tag, [DynamicServices_1.pi44Tag, DynamicServices_1.pi47Tag], [DynamicServices_1.pi59Tag], DynamicServices_1.piAddresses[52], DynamicServices_1.piPorts[52]);
var pi55 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi55Tag, [DynamicServices_1.pi42Tag], [DynamicServices_1.pi58Tag], DynamicServices_1.piAddresses[53], DynamicServices_1.piPorts[53]);
var pi56 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi56Tag, [DynamicServices_1.pi49Tag, DynamicServices_1.pi51Tag, DynamicServices_1.pi52Tag], [DynamicServices_1.pi59Tag], DynamicServices_1.piAddresses[54], DynamicServices_1.piPorts[54]);
var pi57 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi57Tag, [DynamicServices_1.pi48Tag, DynamicServices_1.pi50Tag], [DynamicServices_1.pi59Tag], DynamicServices_1.piAddresses[55], DynamicServices_1.piPorts[55]);
var pi58 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi58Tag, [DynamicServices_1.pi53Tag, DynamicServices_1.pi55Tag], [DynamicServices_1.pi59Tag], DynamicServices_1.piAddresses[56], DynamicServices_1.piPorts[56]);
var pi59 = new DynamicServices_1.ServiceInfo(DynamicServices_1.pi59Tag, [DynamicServices_1.pi57Tag, DynamicServices_1.pi56Tag, DynamicServices_1.pi54Tag, DynamicServices_1.pi58Tag], [], DynamicServices_1.piAddresses[57], DynamicServices_1.piPorts[57]);
/*for(var i =2;i<60;i++){
console.log("var pi"+i+" = new ServiceInfo(pi"+i+"Tag,[],[],piAddresses["+(i-2)+"],piPorts["+(i-2)+"])")
}*/
let isQPROP = process.argv[2] == "true";
let toSpawn = DynamicServices_1.mapToName(process.argv[3]);
let dataRate = parseInt(process.argv[4]);
let totalVals = dataRate * 30;
let csvFile = process.argv[5];
let changes = parseInt(process.argv[6]);
function getRandomPi(lesserBound, upperbound) {
    let index = Math.floor(Math.random() * DynamicServices_1.piIds.length) + 2;
    //return eval("pi"+index)
    if (index <= lesserBound || index >= upperbound) {
        return getRandomPi(lesserBound, upperbound);
    }
    else {
        return index;
    }
}
let dynLinks = [];
for (var i = 0; i < changes; i++) {
    let fromIndex = getRandomPi(2, 59);
    let toIndex = fromIndex + Math.floor(Math.random() * (59 - fromIndex)) + 1;
    //let toIndex = getRandomPi(fromIndex,59)
    let from = eval("pi" + fromIndex);
    let to = eval("pi" + toIndex);
    dynLinks.push({ from: from.tag, to: to.tag });
}
/*for(var i= 12;i < 60;i++){
    console.log("case \"pi"+i+"\":")
    console.log("new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi"+i+".address,pi"+i+".port,pi"+i+".tag,pi"+i+".parents,pi"+i+".children,pi"+i+".dynamicLinks)")
    console.log("break;")
}*/
switch (toSpawn) {
    case "admitter":
        new DynamicServices_1.Admitter(totalVals, csvFile, dataRate, 10, dynLinks);
        break;
    case "monitor":
        new ServiceMonitor_1.ServiceMonitor();
        break;
    case "pi2":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi2.address, pi2.port, pi2.tag, pi2.parents, pi2.children, dynLinks);
        break;
    case "pi3":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi3.address, pi3.port, pi3.tag, pi3.parents, pi3.children, pi3.dynamicLinks);
        break;
    case "pi4":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi4.address, pi4.port, pi4.tag, pi4.parents, pi4.children, pi4.dynamicLinks);
        break;
    case "pi5":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi5.address, pi5.port, pi5.tag, pi5.parents, pi5.children, pi5.dynamicLinks);
        break;
    case "pi6":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi6.address, pi6.port, pi6.tag, pi6.parents, pi6.children, pi6.dynamicLinks);
        break;
    case "pi7":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi7.address, pi7.port, pi7.tag, pi7.parents, pi7.children, pi7.dynamicLinks);
        break;
    case "pi8":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi8.address, pi8.port, pi8.tag, pi8.parents, pi8.children, pi8.dynamicLinks);
        break;
    case "pi9":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi9.address, pi9.port, pi9.tag, pi9.parents, pi9.children, pi9.dynamicLinks);
        break;
    case "pi10":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi10.address, pi10.port, pi10.tag, pi10.parents, pi10.children, pi10.dynamicLinks);
        break;
    case "pi11":
        new DynamicServices_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi11.address, pi11.port, pi11.tag, pi11.parents, pi11.children, pi11.dynamicLinks);
        break;
    case "pi12":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi12.address, pi12.port, pi12.tag, pi12.parents, pi12.children, pi12.dynamicLinks);
        break;
    case "pi13":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi13.address, pi13.port, pi13.tag, pi13.parents, pi13.children, pi13.dynamicLinks);
        break;
    case "pi14":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi14.address, pi14.port, pi14.tag, pi14.parents, pi14.children, pi14.dynamicLinks);
        break;
    case "pi15":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi15.address, pi15.port, pi15.tag, pi15.parents, pi15.children, pi15.dynamicLinks);
        break;
    case "pi16":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi16.address, pi16.port, pi16.tag, pi16.parents, pi16.children, pi16.dynamicLinks);
        break;
    case "pi17":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi17.address, pi17.port, pi17.tag, pi17.parents, pi17.children, pi17.dynamicLinks);
        break;
    case "pi18":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi18.address, pi18.port, pi18.tag, pi18.parents, pi18.children, pi18.dynamicLinks);
        break;
    case "pi19":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi19.address, pi19.port, pi19.tag, pi19.parents, pi19.children, pi19.dynamicLinks);
        break;
    case "pi20":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi20.address, pi20.port, pi20.tag, pi20.parents, pi20.children, pi20.dynamicLinks);
        break;
    case "pi21":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi21.address, pi21.port, pi21.tag, pi21.parents, pi21.children, pi21.dynamicLinks);
        break;
    case "pi22":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi22.address, pi22.port, pi22.tag, pi22.parents, pi22.children, pi22.dynamicLinks);
        break;
    case "pi23":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi23.address, pi23.port, pi23.tag, pi23.parents, pi23.children, pi23.dynamicLinks);
        break;
    case "pi24":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi24.address, pi24.port, pi24.tag, pi24.parents, pi24.children, pi24.dynamicLinks);
        break;
    case "pi25":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi25.address, pi25.port, pi25.tag, pi25.parents, pi25.children, pi25.dynamicLinks);
        break;
    case "pi26":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi26.address, pi26.port, pi26.tag, pi26.parents, pi26.children, pi26.dynamicLinks);
        break;
    case "pi27":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi27.address, pi27.port, pi27.tag, pi27.parents, pi27.children, pi27.dynamicLinks);
        break;
    case "pi28":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi28.address, pi28.port, pi28.tag, pi28.parents, pi28.children, pi28.dynamicLinks);
        break;
    case "pi29":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi29.address, pi29.port, pi29.tag, pi29.parents, pi29.children, pi29.dynamicLinks);
        break;
    case "pi30":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi30.address, pi30.port, pi30.tag, pi30.parents, pi30.children, pi30.dynamicLinks);
        break;
    case "pi31":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi31.address, pi31.port, pi31.tag, pi31.parents, pi31.children, pi31.dynamicLinks);
        break;
    case "pi32":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi32.address, pi32.port, pi32.tag, pi32.parents, pi32.children, pi32.dynamicLinks);
        break;
    case "pi33":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi33.address, pi33.port, pi33.tag, pi33.parents, pi33.children, pi33.dynamicLinks);
        break;
    case "pi34":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi34.address, pi34.port, pi34.tag, pi34.parents, pi34.children, pi34.dynamicLinks);
        break;
    case "pi35":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi35.address, pi35.port, pi35.tag, pi35.parents, pi35.children, pi35.dynamicLinks);
        break;
    case "pi36":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi36.address, pi36.port, pi36.tag, pi36.parents, pi36.children, pi36.dynamicLinks);
        break;
    case "pi37":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi37.address, pi37.port, pi37.tag, pi37.parents, pi37.children, pi37.dynamicLinks);
        break;
    case "pi38":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi38.address, pi38.port, pi38.tag, pi38.parents, pi38.children, pi38.dynamicLinks);
        break;
    case "pi39":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi39.address, pi39.port, pi39.tag, pi39.parents, pi39.children, pi39.dynamicLinks);
        break;
    case "pi40":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi40.address, pi40.port, pi40.tag, pi40.parents, pi40.children, pi40.dynamicLinks);
        break;
    case "pi41":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi41.address, pi41.port, pi41.tag, pi41.parents, pi41.children, pi41.dynamicLinks);
        break;
    case "pi42":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi42.address, pi42.port, pi42.tag, pi42.parents, pi42.children, pi42.dynamicLinks);
        break;
    case "pi43":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi43.address, pi43.port, pi43.tag, pi43.parents, pi43.children, pi43.dynamicLinks);
        break;
    case "pi44":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi44.address, pi44.port, pi44.tag, pi44.parents, pi44.children, pi44.dynamicLinks);
        break;
    case "pi45":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi45.address, pi45.port, pi45.tag, pi45.parents, pi45.children, pi45.dynamicLinks);
        break;
    case "pi46":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi46.address, pi46.port, pi46.tag, pi46.parents, pi46.children, pi46.dynamicLinks);
        break;
    case "pi47":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi47.address, pi47.port, pi47.tag, pi47.parents, pi47.children, pi47.dynamicLinks);
        break;
    case "pi48":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi48.address, pi48.port, pi48.tag, pi48.parents, pi48.children, pi48.dynamicLinks);
        break;
    case "pi49":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi49.address, pi49.port, pi49.tag, pi49.parents, pi49.children, pi49.dynamicLinks);
        break;
    case "pi50":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi50.address, pi50.port, pi50.tag, pi50.parents, pi50.children, pi50.dynamicLinks);
        break;
    case "pi51":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi51.address, pi51.port, pi51.tag, pi51.parents, pi51.children, pi51.dynamicLinks);
        break;
    case "pi52":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi52.address, pi52.port, pi52.tag, pi52.parents, pi52.children, pi52.dynamicLinks);
        break;
    case "pi53":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi53.address, pi53.port, pi53.tag, pi53.parents, pi53.children, pi53.dynamicLinks);
        break;
    case "pi54":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi54.address, pi54.port, pi54.tag, pi54.parents, pi54.children, pi54.dynamicLinks);
        break;
    case "pi55":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi55.address, pi55.port, pi55.tag, pi55.parents, pi55.children, pi55.dynamicLinks);
        break;
    case "pi56":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi56.address, pi56.port, pi56.tag, pi56.parents, pi56.children, pi56.dynamicLinks);
        break;
    case "pi57":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi57.address, pi57.port, pi57.tag, pi57.parents, pi57.children, pi57.dynamicLinks);
        break;
    case "pi58":
        new DynamicServices_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi58.address, pi58.port, pi58.tag, pi58.parents, pi58.children, pi58.dynamicLinks);
        break;
    case "pi59":
        new DynamicServices_1.SinkService(isQPROP, dataRate, totalVals, csvFile, pi59.address, pi59.port, pi59.tag, pi59.parents, pi59.children, 10);
        break;
    default:
        throw new Error("unknown spawning argument");
}
//# sourceMappingURL=DynamicRegular.js.map