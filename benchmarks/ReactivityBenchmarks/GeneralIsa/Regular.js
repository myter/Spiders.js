Object.defineProperty(exports, "__esModule", { value: true });
const Services_1 = require("./Services");
const ServiceMonitor_1 = require("../../../src/MicroService/ServiceMonitor");
var pi2 = new Services_1.ServiceInfo(Services_1.pi2Tag, [], [Services_1.pi12Tag], Services_1.piAddresses[0], Services_1.piPorts[0]);
var pi3 = new Services_1.ServiceInfo(Services_1.pi3Tag, [], [Services_1.pi12Tag], Services_1.piAddresses[1], Services_1.piPorts[1]);
var pi4 = new Services_1.ServiceInfo(Services_1.pi4Tag, [], [Services_1.pi13Tag, Services_1.pi15Tag], Services_1.piAddresses[2], Services_1.piPorts[2]);
var pi5 = new Services_1.ServiceInfo(Services_1.pi5Tag, [], [Services_1.pi14Tag], Services_1.piAddresses[3], Services_1.piPorts[3]);
var pi6 = new Services_1.ServiceInfo(Services_1.pi6Tag, [], [Services_1.pi13Tag, Services_1.pi15Tag], Services_1.piAddresses[4], Services_1.piPorts[4]);
var pi7 = new Services_1.ServiceInfo(Services_1.pi7Tag, [], [Services_1.pi16Tag], Services_1.piAddresses[5], Services_1.piPorts[5]);
var pi8 = new Services_1.ServiceInfo(Services_1.pi8Tag, [], [Services_1.pi16Tag], Services_1.piAddresses[6], Services_1.piPorts[6]);
var pi9 = new Services_1.ServiceInfo(Services_1.pi9Tag, [], [Services_1.pi16Tag, Services_1.pi17Tag, Services_1.pi18Tag], Services_1.piAddresses[7], Services_1.piPorts[7]);
var pi10 = new Services_1.ServiceInfo(Services_1.pi10Tag, [], [Services_1.pi19Tag, Services_1.pi20Tag], Services_1.piAddresses[8], Services_1.piPorts[8]);
var pi11 = new Services_1.ServiceInfo(Services_1.pi11Tag, [], [Services_1.pi19Tag, Services_1.pi20Tag], Services_1.piAddresses[9], Services_1.piPorts[9]);
var pi12 = new Services_1.ServiceInfo(Services_1.pi12Tag, [Services_1.pi2Tag, Services_1.pi3Tag], [Services_1.pi21Tag, Services_1.pi23Tag], Services_1.piAddresses[10], Services_1.piPorts[10]);
var pi13 = new Services_1.ServiceInfo(Services_1.pi13Tag, [Services_1.pi4Tag, Services_1.pi6Tag], [Services_1.pi22Tag], Services_1.piAddresses[11], Services_1.piPorts[11]);
var pi14 = new Services_1.ServiceInfo(Services_1.pi14Tag, [Services_1.pi5Tag], [Services_1.pi21Tag, Services_1.pi22Tag], Services_1.piAddresses[12], Services_1.piPorts[12]);
var pi15 = new Services_1.ServiceInfo(Services_1.pi15Tag, [Services_1.pi4Tag, Services_1.pi6Tag], [Services_1.pi23Tag, Services_1.pi24Tag], Services_1.piAddresses[13], Services_1.piPorts[13]);
var pi16 = new Services_1.ServiceInfo(Services_1.pi16Tag, [Services_1.pi7Tag, Services_1.pi8Tag, Services_1.pi9Tag], [Services_1.pi24Tag, Services_1.pi25Tag, Services_1.pi26Tag], Services_1.piAddresses[14], Services_1.piPorts[14]);
var pi17 = new Services_1.ServiceInfo(Services_1.pi17Tag, [Services_1.pi9Tag], [Services_1.pi26Tag, Services_1.pi27Tag], Services_1.piAddresses[15], Services_1.piPorts[15]);
var pi18 = new Services_1.ServiceInfo(Services_1.pi18Tag, [Services_1.pi9Tag], [Services_1.pi27Tag], Services_1.piAddresses[16], Services_1.piPorts[16]);
var pi19 = new Services_1.ServiceInfo(Services_1.pi19Tag, [Services_1.pi10Tag, Services_1.pi11Tag], [Services_1.pi27Tag, Services_1.pi28Tag, Services_1.pi29Tag], Services_1.piAddresses[17], Services_1.piPorts[17]);
var pi20 = new Services_1.ServiceInfo(Services_1.pi20Tag, [Services_1.pi10Tag, Services_1.pi11Tag], [Services_1.pi28Tag], Services_1.piAddresses[18], Services_1.piPorts[18]);
var pi21 = new Services_1.ServiceInfo(Services_1.pi21Tag, [Services_1.pi12Tag, Services_1.pi14Tag], [Services_1.pi30Tag, Services_1.pi31Tag], Services_1.piAddresses[19], Services_1.piPorts[19]);
var pi22 = new Services_1.ServiceInfo(Services_1.pi22Tag, [Services_1.pi13Tag, Services_1.pi14Tag], [Services_1.pi32Tag], Services_1.piAddresses[20], Services_1.piPorts[20]);
var pi23 = new Services_1.ServiceInfo(Services_1.pi23Tag, [Services_1.pi12Tag, Services_1.pi15Tag], [Services_1.pi33Tag], Services_1.piAddresses[21], Services_1.piPorts[21]);
var pi24 = new Services_1.ServiceInfo(Services_1.pi24Tag, [Services_1.pi15Tag, Services_1.pi16Tag], [Services_1.pi33Tag, Services_1.pi34Tag], Services_1.piAddresses[22], Services_1.piPorts[22]);
var pi25 = new Services_1.ServiceInfo(Services_1.pi25Tag, [Services_1.pi16Tag], [Services_1.pi34Tag], Services_1.piAddresses[23], Services_1.piPorts[23]);
var pi26 = new Services_1.ServiceInfo(Services_1.pi26Tag, [Services_1.pi16Tag, Services_1.pi17Tag], [Services_1.pi35Tag], Services_1.piAddresses[24], Services_1.piPorts[24]);
var pi27 = new Services_1.ServiceInfo(Services_1.pi27Tag, [Services_1.pi17Tag, Services_1.pi18Tag, Services_1.pi19Tag], [Services_1.pi35Tag, Services_1.pi36Tag], Services_1.piAddresses[25], Services_1.piPorts[25]);
var pi28 = new Services_1.ServiceInfo(Services_1.pi28Tag, [Services_1.pi19Tag, Services_1.pi20Tag], [Services_1.pi37Tag], Services_1.piAddresses[26], Services_1.piPorts[26]);
var pi29 = new Services_1.ServiceInfo(Services_1.pi29Tag, [Services_1.pi19Tag], [Services_1.pi37Tag, Services_1.pi38Tag], Services_1.piAddresses[27], Services_1.piPorts[27]);
var pi30 = new Services_1.ServiceInfo(Services_1.pi30Tag, [Services_1.pi21Tag], [Services_1.pi39Tag, Services_1.pi40Tag], Services_1.piAddresses[28], Services_1.piPorts[28]);
var pi31 = new Services_1.ServiceInfo(Services_1.pi31Tag, [Services_1.pi21Tag], [Services_1.pi39Tag], Services_1.piAddresses[29], Services_1.piPorts[29]);
var pi32 = new Services_1.ServiceInfo(Services_1.pi32Tag, [Services_1.pi22Tag], [Services_1.pi41Tag], Services_1.piAddresses[30], Services_1.piPorts[30]);
var pi33 = new Services_1.ServiceInfo(Services_1.pi33Tag, [Services_1.pi23Tag, Services_1.pi24Tag], [Services_1.pi42Tag], Services_1.piAddresses[31], Services_1.piPorts[31]);
var pi34 = new Services_1.ServiceInfo(Services_1.pi34Tag, [Services_1.pi24Tag, Services_1.pi25Tag], [Services_1.pi41Tag, Services_1.pi43Tag], Services_1.piAddresses[32], Services_1.piPorts[32]);
var pi35 = new Services_1.ServiceInfo(Services_1.pi35Tag, [Services_1.pi26Tag, Services_1.pi27Tag], [Services_1.pi47Tag], Services_1.piAddresses[33], Services_1.piPorts[33]);
var pi36 = new Services_1.ServiceInfo(Services_1.pi36Tag, [Services_1.pi27Tag], [Services_1.pi44Tag, Services_1.pi45Tag], Services_1.piAddresses[34], Services_1.piPorts[34]);
var pi37 = new Services_1.ServiceInfo(Services_1.pi37Tag, [Services_1.pi28Tag, Services_1.pi29Tag], [Services_1.pi46Tag], Services_1.piAddresses[35], Services_1.piPorts[35]);
var pi38 = new Services_1.ServiceInfo(Services_1.pi38Tag, [Services_1.pi29Tag], [Services_1.pi44Tag], Services_1.piAddresses[36], Services_1.piPorts[36]);
var pi39 = new Services_1.ServiceInfo(Services_1.pi39Tag, [Services_1.pi30Tag, Services_1.pi31Tag], [Services_1.pi48Tag], Services_1.piAddresses[37], Services_1.piPorts[37]);
var pi40 = new Services_1.ServiceInfo(Services_1.pi40Tag, [Services_1.pi30Tag], [Services_1.pi50Tag], Services_1.piAddresses[38], Services_1.piPorts[38]);
var pi41 = new Services_1.ServiceInfo(Services_1.pi41Tag, [Services_1.pi32Tag, Services_1.pi34Tag], [Services_1.pi49Tag], Services_1.piAddresses[39], Services_1.piPorts[39]);
var pi42 = new Services_1.ServiceInfo(Services_1.pi42Tag, [Services_1.pi33Tag], [Services_1.pi50Tag, Services_1.pi55Tag], Services_1.piAddresses[40], Services_1.piPorts[40]);
var pi43 = new Services_1.ServiceInfo(Services_1.pi43Tag, [Services_1.pi34Tag], [Services_1.pi51Tag], Services_1.piAddresses[41], Services_1.piPorts[41]);
var pi44 = new Services_1.ServiceInfo(Services_1.pi44Tag, [Services_1.pi36Tag, Services_1.pi38Tag], [Services_1.pi52Tag, Services_1.pi54Tag], Services_1.piAddresses[42], Services_1.piPorts[42]);
var pi45 = new Services_1.ServiceInfo(Services_1.pi45Tag, [Services_1.pi36Tag], [Services_1.pi53Tag], Services_1.piAddresses[43], Services_1.piPorts[43]);
var pi46 = new Services_1.ServiceInfo(Services_1.pi46Tag, [Services_1.pi37Tag], [Services_1.pi53Tag], Services_1.piAddresses[44], Services_1.piPorts[44]);
var pi47 = new Services_1.ServiceInfo(Services_1.pi47Tag, [Services_1.pi35Tag], [Services_1.pi54Tag], Services_1.piAddresses[45], Services_1.piPorts[45]);
var pi48 = new Services_1.ServiceInfo(Services_1.pi48Tag, [Services_1.pi39Tag], [Services_1.pi57Tag], Services_1.piAddresses[46], Services_1.piPorts[46]);
var pi49 = new Services_1.ServiceInfo(Services_1.pi49Tag, [Services_1.pi41Tag], [Services_1.pi56Tag], Services_1.piAddresses[47], Services_1.piPorts[47]);
var pi50 = new Services_1.ServiceInfo(Services_1.pi50Tag, [Services_1.pi40Tag, Services_1.pi42Tag], [Services_1.pi57Tag], Services_1.piAddresses[48], Services_1.piPorts[48]);
var pi51 = new Services_1.ServiceInfo(Services_1.pi51Tag, [Services_1.pi43Tag], [Services_1.pi56Tag], Services_1.piAddresses[49], Services_1.piPorts[49]);
var pi52 = new Services_1.ServiceInfo(Services_1.pi52Tag, [Services_1.pi44Tag], [Services_1.pi56Tag], Services_1.piAddresses[50], Services_1.piPorts[50]);
var pi53 = new Services_1.ServiceInfo(Services_1.pi53Tag, [Services_1.pi45Tag, Services_1.pi46Tag], [Services_1.pi58Tag], Services_1.piAddresses[51], Services_1.piPorts[51]);
var pi54 = new Services_1.ServiceInfo(Services_1.pi54Tag, [Services_1.pi44Tag, Services_1.pi47Tag], [Services_1.pi59Tag], Services_1.piAddresses[52], Services_1.piPorts[52]);
var pi55 = new Services_1.ServiceInfo(Services_1.pi55Tag, [Services_1.pi42Tag], [Services_1.pi58Tag], Services_1.piAddresses[53], Services_1.piPorts[53]);
var pi56 = new Services_1.ServiceInfo(Services_1.pi56Tag, [Services_1.pi49Tag, Services_1.pi51Tag, Services_1.pi52Tag], [Services_1.pi59Tag], Services_1.piAddresses[54], Services_1.piPorts[54]);
var pi57 = new Services_1.ServiceInfo(Services_1.pi57Tag, [Services_1.pi48Tag, Services_1.pi50Tag], [Services_1.pi59Tag], Services_1.piAddresses[55], Services_1.piPorts[55]);
var pi58 = new Services_1.ServiceInfo(Services_1.pi58Tag, [Services_1.pi53Tag, Services_1.pi55Tag], [Services_1.pi59Tag], Services_1.piAddresses[56], Services_1.piPorts[56]);
var pi59 = new Services_1.ServiceInfo(Services_1.pi59Tag, [Services_1.pi57Tag, Services_1.pi56Tag, Services_1.pi54Tag, Services_1.pi58Tag], [], Services_1.piAddresses[57], Services_1.piPorts[57]);
/*for(var i =2;i<60;i++){
console.log("var pi"+i+" = new ServiceInfo(pi"+i+"Tag,[],[],piAddresses["+(i-2)+"],piPorts["+(i-2)+"])")
}*/
let isQPROP = process.argv[2] == "true";
let toSpawn = Services_1.mapToName(process.argv[3]);
let dataRate = parseInt(process.argv[4]) / 10;
let totalVals = dataRate * 30;
let csvFile = process.argv[5];
let changes = parseInt(process.argv[6]);
/*function getRandomPi(lesserBound,upperbound){
    let index = Math.floor(Math.random() * piIds.length) + 2
    //return eval("pi"+index)
    if(index <= lesserBound || index >= upperbound){
        return getRandomPi(lesserBound,upperbound)
    }
    else{
        return index
    }
}*/
//Avoid introducing cycles and double dependencies
let dynLinks = [];
if (changes == 1) {
    dynLinks.push({ from: pi4.tag, to: pi40.tag });
}
else if (changes == 5) {
    dynLinks.push({ from: pi4.tag, to: pi40.tag });
    dynLinks.push({ from: pi20.tag, to: pi47.tag });
    dynLinks.push({ from: pi35.tag, to: pi44.tag });
    dynLinks.push({ from: pi42.tag, to: pi56.tag });
    dynLinks.push({ from: pi50.tag, to: pi59.tag });
}
else if (changes == 10) {
    dynLinks.push({ from: pi4.tag, to: pi40.tag });
    dynLinks.push({ from: pi20.tag, to: pi47.tag });
    dynLinks.push({ from: pi35.tag, to: pi44.tag });
    dynLinks.push({ from: pi42.tag, to: pi56.tag });
    dynLinks.push({ from: pi50.tag, to: pi59.tag });
    dynLinks.push({ from: pi31.tag, to: pi40.tag });
    dynLinks.push({ from: pi21.tag, to: pi32.tag });
    dynLinks.push({ from: pi3.tag, to: pi13.tag });
    dynLinks.push({ from: pi7.tag, to: pi15.tag });
    dynLinks.push({ from: pi10.tag, to: pi18.tag });
}
else if (changes == 15) {
    dynLinks.push({ from: pi4.tag, to: pi40.tag });
    dynLinks.push({ from: pi20.tag, to: pi47.tag });
    dynLinks.push({ from: pi35.tag, to: pi44.tag });
    dynLinks.push({ from: pi42.tag, to: pi56.tag });
    dynLinks.push({ from: pi50.tag, to: pi59.tag });
    dynLinks.push({ from: pi31.tag, to: pi40.tag });
    dynLinks.push({ from: pi21.tag, to: pi32.tag });
    dynLinks.push({ from: pi3.tag, to: pi13.tag });
    dynLinks.push({ from: pi7.tag, to: pi15.tag });
    dynLinks.push({ from: pi10.tag, to: pi18.tag });
    dynLinks.push({ from: pi2.tag, to: pi13.tag });
    dynLinks.push({ from: pi28.tag, to: pi36.tag });
    dynLinks.push({ from: pi28.tag, to: pi38.tag });
    dynLinks.push({ from: pi31.tag, to: pi41.tag });
    dynLinks.push({ from: pi47.tag, to: pi55.tag });
}
else {
    dynLinks.push({ from: pi4.tag, to: pi40.tag });
    dynLinks.push({ from: pi20.tag, to: pi47.tag });
    dynLinks.push({ from: pi35.tag, to: pi44.tag });
    dynLinks.push({ from: pi42.tag, to: pi56.tag });
    dynLinks.push({ from: pi50.tag, to: pi59.tag });
    dynLinks.push({ from: pi31.tag, to: pi40.tag });
    dynLinks.push({ from: pi21.tag, to: pi32.tag });
    dynLinks.push({ from: pi3.tag, to: pi13.tag });
    dynLinks.push({ from: pi7.tag, to: pi15.tag });
    dynLinks.push({ from: pi10.tag, to: pi18.tag });
    dynLinks.push({ from: pi2.tag, to: pi13.tag });
    dynLinks.push({ from: pi28.tag, to: pi36.tag });
    dynLinks.push({ from: pi28.tag, to: pi38.tag });
    dynLinks.push({ from: pi31.tag, to: pi41.tag });
    dynLinks.push({ from: pi47.tag, to: pi55.tag });
    //TODO
}
/*for(var i=0;i < changes;i++){
    let fromIndex = getRandomPi(11,58)
    //let toIndex   = fromIndex + Math.floor(Math.random() * (59 - fromIndex)) + 1
    let toIndex = fromIndex + 1
    let from = eval("pi"+fromIndex)
    let to   = eval("pi"+toIndex)
    let retry = false
    from.children.forEach((childTag)=>{
        if(childTag.tagVal == to.tag.tagVal){
            i--
            retry = true
        }
    })
    if(!retry){
        dynLinks.push({from: from.tag,to: to.tag})
    }
}*/
switch (toSpawn) {
    case "admitter":
        new Services_1.Admitter(totalVals, csvFile, dataRate, 10, dynLinks, changes);
        break;
    case "monitor":
        new ServiceMonitor_1.ServiceMonitor(Services_1.monitorIP, Services_1.monitorPort);
        break;
    case "pi2":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi2.address, pi2.port, pi2.tag, pi2.parents, pi2.children, dynLinks, changes);
        break;
    case "pi3":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi3.address, pi3.port, pi3.tag, pi3.parents, pi3.children, [], changes);
        break;
    case "pi4":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi4.address, pi4.port, pi4.tag, pi4.parents, pi4.children, [], changes);
        break;
    case "pi5":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi5.address, pi5.port, pi5.tag, pi5.parents, pi5.children, [], changes);
        break;
    case "pi6":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi6.address, pi6.port, pi6.tag, pi6.parents, pi6.children, [], changes);
        break;
    case "pi7":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi7.address, pi7.port, pi7.tag, pi7.parents, pi7.children, [], changes);
        break;
    case "pi8":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi8.address, pi8.port, pi8.tag, pi8.parents, pi8.children, [], changes);
        break;
    case "pi9":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi9.address, pi9.port, pi9.tag, pi9.parents, pi9.children, [], changes);
        break;
    case "pi10":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi10.address, pi10.port, pi10.tag, pi10.parents, pi10.children, [], changes);
        break;
    case "pi11":
        new Services_1.SourceService(isQPROP, dataRate, totalVals, csvFile, pi11.address, pi11.port, pi11.tag, pi11.parents, pi11.children, [], changes);
        break;
    case "pi12":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi12.address, pi12.port, pi12.tag, pi12.parents, pi12.children, changes);
        break;
    case "pi13":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi13.address, pi13.port, pi13.tag, pi13.parents, pi13.children, changes);
        break;
    case "pi14":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi14.address, pi14.port, pi14.tag, pi14.parents, pi14.children, changes);
        break;
    case "pi15":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi15.address, pi15.port, pi15.tag, pi15.parents, pi15.children, changes);
        break;
    case "pi16":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi16.address, pi16.port, pi16.tag, pi16.parents, pi16.children, changes);
        break;
    case "pi17":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi17.address, pi17.port, pi17.tag, pi17.parents, pi17.children, changes);
        break;
    case "pi18":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi18.address, pi18.port, pi18.tag, pi18.parents, pi18.children, changes);
        break;
    case "pi19":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi19.address, pi19.port, pi19.tag, pi19.parents, pi19.children, changes);
        break;
    case "pi20":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi20.address, pi20.port, pi20.tag, pi20.parents, pi20.children, changes);
        break;
    case "pi21":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi21.address, pi21.port, pi21.tag, pi21.parents, pi21.children, changes);
        break;
    case "pi22":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi22.address, pi22.port, pi22.tag, pi22.parents, pi22.children, changes);
        break;
    case "pi23":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi23.address, pi23.port, pi23.tag, pi23.parents, pi23.children, changes);
        break;
    case "pi24":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi24.address, pi24.port, pi24.tag, pi24.parents, pi24.children, changes);
        break;
    case "pi25":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi25.address, pi25.port, pi25.tag, pi25.parents, pi25.children, changes);
        break;
    case "pi26":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi26.address, pi26.port, pi26.tag, pi26.parents, pi26.children, changes);
        break;
    case "pi27":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi27.address, pi27.port, pi27.tag, pi27.parents, pi27.children, changes);
        break;
    case "pi28":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi28.address, pi28.port, pi28.tag, pi28.parents, pi28.children, changes);
        break;
    case "pi29":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi29.address, pi29.port, pi29.tag, pi29.parents, pi29.children, changes);
        break;
    case "pi30":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi30.address, pi30.port, pi30.tag, pi30.parents, pi30.children, changes);
        break;
    case "pi31":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi31.address, pi31.port, pi31.tag, pi31.parents, pi31.children, changes);
        break;
    case "pi32":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi32.address, pi32.port, pi32.tag, pi32.parents, pi32.children, changes);
        break;
    case "pi33":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi33.address, pi33.port, pi33.tag, pi33.parents, pi33.children, changes);
        break;
    case "pi34":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi34.address, pi34.port, pi34.tag, pi34.parents, pi34.children, changes);
        break;
    case "pi35":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi35.address, pi35.port, pi35.tag, pi35.parents, pi35.children, changes);
        break;
    case "pi36":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi36.address, pi36.port, pi36.tag, pi36.parents, pi36.children, changes);
        break;
    case "pi37":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi37.address, pi37.port, pi37.tag, pi37.parents, pi37.children, changes);
        break;
    case "pi38":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi38.address, pi38.port, pi38.tag, pi38.parents, pi38.children, changes);
        break;
    case "pi39":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi39.address, pi39.port, pi39.tag, pi39.parents, pi39.children, changes);
        break;
    case "pi40":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi40.address, pi40.port, pi40.tag, pi40.parents, pi40.children, changes);
        break;
    case "pi41":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi41.address, pi41.port, pi41.tag, pi41.parents, pi41.children, changes);
        break;
    case "pi42":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi42.address, pi42.port, pi42.tag, pi42.parents, pi42.children, changes);
        break;
    case "pi43":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi43.address, pi43.port, pi43.tag, pi43.parents, pi43.children, changes);
        break;
    case "pi44":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi44.address, pi44.port, pi44.tag, pi44.parents, pi44.children, changes);
        break;
    case "pi45":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi45.address, pi45.port, pi45.tag, pi45.parents, pi45.children, changes);
        break;
    case "pi46":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi46.address, pi46.port, pi46.tag, pi46.parents, pi46.children, changes);
        break;
    case "pi47":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi47.address, pi47.port, pi47.tag, pi47.parents, pi47.children, changes);
        break;
    case "pi48":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi48.address, pi48.port, pi48.tag, pi48.parents, pi48.children, changes);
        break;
    case "pi49":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi49.address, pi49.port, pi49.tag, pi49.parents, pi49.children, changes);
        break;
    case "pi50":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi50.address, pi50.port, pi50.tag, pi50.parents, pi50.children, changes);
        break;
    case "pi51":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi51.address, pi51.port, pi51.tag, pi51.parents, pi51.children, changes);
        break;
    case "pi52":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi52.address, pi52.port, pi52.tag, pi52.parents, pi52.children, changes);
        break;
    case "pi53":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi53.address, pi53.port, pi53.tag, pi53.parents, pi53.children, changes);
        break;
    case "pi54":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi54.address, pi54.port, pi54.tag, pi54.parents, pi54.children, changes);
        break;
    case "pi55":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi55.address, pi55.port, pi55.tag, pi55.parents, pi55.children, changes);
        break;
    case "pi56":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi56.address, pi56.port, pi56.tag, pi56.parents, pi56.children, changes);
        break;
    case "pi57":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi57.address, pi57.port, pi57.tag, pi57.parents, pi57.children, changes);
        break;
    case "pi58":
        new Services_1.DerivedService(isQPROP, dataRate, totalVals, csvFile, pi58.address, pi58.port, pi58.tag, pi58.parents, pi58.children, changes);
        break;
    case "pi59":
        new Services_1.SinkService(isQPROP, dataRate, totalVals, csvFile, pi59.address, pi59.port, pi59.tag, pi59.parents, pi59.children, 10, changes);
        break;
    default:
        throw new Error("unknown spawning argument");
}
//# sourceMappingURL=Regular.js.map