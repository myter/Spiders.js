import {
    Admitter, DerivedService, mapToName, monitorIP, monitorPort,
    pi10Tag, pi11Tag, pi12Tag, pi13Tag, pi14Tag, pi15Tag, pi16Tag, pi17Tag, pi18Tag, pi19Tag, pi20Tag, pi21Tag, pi22Tag,
    pi23Tag, pi24Tag, pi25Tag, pi26Tag, pi27Tag, pi28Tag, pi29Tag,
    pi2Tag, pi30Tag, pi31Tag, pi32Tag, pi33Tag, pi34Tag, pi35Tag, pi36Tag, pi37Tag, pi38Tag, pi39Tag, pi3Tag, pi40Tag,
    pi41Tag, pi42Tag, pi43Tag, pi44Tag, pi45Tag, pi46Tag, pi47Tag, pi48Tag, pi49Tag,
    pi4Tag, pi50Tag, pi51Tag, pi52Tag, pi53Tag, pi54Tag, pi55Tag, pi56Tag, pi57Tag, pi58Tag, pi59Tag,
    pi5Tag,
    pi6Tag,
    pi7Tag,
    pi8Tag,
    pi9Tag,
    piAddresses, piIds,
    piPorts,
    ServiceInfo, SinkService, SourceService
} from "./Services";
import {ServiceMonitor} from "../../../src/MicroService/ServiceMonitor";

var pi2 = new ServiceInfo(pi2Tag,[],[pi12Tag],piAddresses[0],piPorts[0])
var pi3 = new ServiceInfo(pi3Tag,[],[pi12Tag],piAddresses[1],piPorts[1])
var pi4 = new ServiceInfo(pi4Tag,[],[pi13Tag,pi15Tag],piAddresses[2],piPorts[2])
var pi5 = new ServiceInfo(pi5Tag,[],[pi14Tag],piAddresses[3],piPorts[3])
var pi6 = new ServiceInfo(pi6Tag,[],[pi13Tag,pi15Tag],piAddresses[4],piPorts[4])
var pi7 = new ServiceInfo(pi7Tag,[],[pi16Tag],piAddresses[5],piPorts[5])
var pi8 = new ServiceInfo(pi8Tag,[],[pi16Tag],piAddresses[6],piPorts[6])
var pi9 = new ServiceInfo(pi9Tag,[],[pi16Tag,pi17Tag,pi18Tag],piAddresses[7],piPorts[7])
var pi10 = new ServiceInfo(pi10Tag,[],[pi19Tag,pi20Tag],piAddresses[8],piPorts[8])
var pi11 = new ServiceInfo(pi11Tag,[],[pi19Tag,pi20Tag],piAddresses[9],piPorts[9])
var pi12 = new ServiceInfo(pi12Tag,[pi2Tag,pi3Tag],[pi21Tag,pi23Tag],piAddresses[10],piPorts[10])
var pi13 = new ServiceInfo(pi13Tag,[pi4Tag,pi6Tag],[pi22Tag],piAddresses[11],piPorts[11])
var pi14 = new ServiceInfo(pi14Tag,[pi5Tag],[pi21Tag,pi22Tag],piAddresses[12],piPorts[12])
var pi15 = new ServiceInfo(pi15Tag,[pi4Tag,pi6Tag],[pi23Tag,pi24Tag],piAddresses[13],piPorts[13])
var pi16 = new ServiceInfo(pi16Tag,[pi7Tag,pi8Tag,pi9Tag],[pi24Tag,pi25Tag,pi26Tag],piAddresses[14],piPorts[14])
var pi17 = new ServiceInfo(pi17Tag,[pi9Tag],[pi26Tag,pi27Tag],piAddresses[15],piPorts[15])
var pi18 = new ServiceInfo(pi18Tag,[pi9Tag],[pi27Tag],piAddresses[16],piPorts[16])
var pi19 = new ServiceInfo(pi19Tag,[pi10Tag,pi11Tag],[pi27Tag,pi28Tag,pi29Tag],piAddresses[17],piPorts[17])
var pi20 = new ServiceInfo(pi20Tag,[pi10Tag,pi11Tag],[pi28Tag],piAddresses[18],piPorts[18])
var pi21 = new ServiceInfo(pi21Tag,[pi12Tag,pi14Tag],[pi30Tag,pi31Tag],piAddresses[19],piPorts[19])
var pi22 = new ServiceInfo(pi22Tag,[pi13Tag,pi14Tag],[pi32Tag],piAddresses[20],piPorts[20])
var pi23 = new ServiceInfo(pi23Tag,[pi12Tag,pi15Tag],[pi33Tag],piAddresses[21],piPorts[21])
var pi24 = new ServiceInfo(pi24Tag,[pi15Tag,pi16Tag],[pi33Tag,pi34Tag],piAddresses[22],piPorts[22])
var pi25 = new ServiceInfo(pi25Tag,[pi16Tag],[pi34Tag],piAddresses[23],piPorts[23])
var pi26 = new ServiceInfo(pi26Tag,[pi16Tag,pi17Tag],[pi35Tag],piAddresses[24],piPorts[24])
var pi27 = new ServiceInfo(pi27Tag,[pi17Tag,pi18Tag,pi19Tag],[pi35Tag,pi36Tag],piAddresses[25],piPorts[25])
var pi28 = new ServiceInfo(pi28Tag,[pi19Tag,pi20Tag],[pi37Tag],piAddresses[26],piPorts[26])
var pi29 = new ServiceInfo(pi29Tag,[pi19Tag],[pi37Tag,pi38Tag],piAddresses[27],piPorts[27])
var pi30 = new ServiceInfo(pi30Tag,[pi21Tag],[pi39Tag,pi40Tag],piAddresses[28],piPorts[28])
var pi31 = new ServiceInfo(pi31Tag,[pi21Tag],[pi39Tag],piAddresses[29],piPorts[29])
var pi32 = new ServiceInfo(pi32Tag,[pi22Tag],[pi41Tag],piAddresses[30],piPorts[30])
var pi33 = new ServiceInfo(pi33Tag,[pi23Tag,pi24Tag],[pi42Tag],piAddresses[31],piPorts[31])
var pi34 = new ServiceInfo(pi34Tag,[pi24Tag,pi25Tag],[pi41Tag,pi43Tag],piAddresses[32],piPorts[32])
var pi35 = new ServiceInfo(pi35Tag,[pi26Tag,pi27Tag],[pi47Tag],piAddresses[33],piPorts[33])
var pi36 = new ServiceInfo(pi36Tag,[pi27Tag],[pi44Tag,pi45Tag],piAddresses[34],piPorts[34])
var pi37 = new ServiceInfo(pi37Tag,[pi28Tag,pi29Tag],[pi46Tag],piAddresses[35],piPorts[35])
var pi38 = new ServiceInfo(pi38Tag,[pi29Tag],[pi44Tag],piAddresses[36],piPorts[36])
var pi39 = new ServiceInfo(pi39Tag,[pi30Tag,pi31Tag],[pi48Tag],piAddresses[37],piPorts[37])
var pi40 = new ServiceInfo(pi40Tag,[pi30Tag],[pi50Tag],piAddresses[38],piPorts[38])
var pi41 = new ServiceInfo(pi41Tag,[pi32Tag,pi34Tag],[pi49Tag],piAddresses[39],piPorts[39])
var pi42 = new ServiceInfo(pi42Tag,[pi33Tag],[pi50Tag,pi55Tag],piAddresses[40],piPorts[40])
var pi43 = new ServiceInfo(pi43Tag,[pi34Tag],[pi51Tag],piAddresses[41],piPorts[41])
var pi44 = new ServiceInfo(pi44Tag,[pi36Tag,pi38Tag],[pi52Tag,pi54Tag],piAddresses[42],piPorts[42])
var pi45 = new ServiceInfo(pi45Tag,[pi36Tag],[pi53Tag],piAddresses[43],piPorts[43])
var pi46 = new ServiceInfo(pi46Tag,[pi37Tag],[pi53Tag],piAddresses[44],piPorts[44])
var pi47 = new ServiceInfo(pi47Tag,[pi35Tag],[pi54Tag],piAddresses[45],piPorts[45])
var pi48 = new ServiceInfo(pi48Tag,[pi39Tag],[pi57Tag],piAddresses[46],piPorts[46])
var pi49 = new ServiceInfo(pi49Tag,[pi41Tag],[pi56Tag],piAddresses[47],piPorts[47])
var pi50 = new ServiceInfo(pi50Tag,[pi40Tag,pi42Tag],[pi57Tag],piAddresses[48],piPorts[48])
var pi51 = new ServiceInfo(pi51Tag,[pi43Tag],[pi56Tag],piAddresses[49],piPorts[49])
var pi52 = new ServiceInfo(pi52Tag,[pi44Tag],[pi56Tag],piAddresses[50],piPorts[50])
var pi53 = new ServiceInfo(pi53Tag,[pi45Tag,pi46Tag],[pi58Tag],piAddresses[51],piPorts[51])
var pi54 = new ServiceInfo(pi54Tag,[pi44Tag,pi47Tag],[pi59Tag],piAddresses[52],piPorts[52])
var pi55 = new ServiceInfo(pi55Tag,[pi42Tag],[pi58Tag],piAddresses[53],piPorts[53])
var pi56 = new ServiceInfo(pi56Tag,[pi49Tag,pi51Tag,pi52Tag],[pi59Tag],piAddresses[54],piPorts[54])
var pi57 = new ServiceInfo(pi57Tag,[pi48Tag,pi50Tag],[pi59Tag],piAddresses[55],piPorts[55])
var pi58 = new ServiceInfo(pi58Tag,[pi53Tag,pi55Tag],[pi59Tag],piAddresses[56],piPorts[56])
var pi59 = new ServiceInfo(pi59Tag,[pi57Tag,pi56Tag,pi54Tag,pi58Tag],[],piAddresses[57],piPorts[57])


/*for(var i =2;i<60;i++){
console.log("var pi"+i+" = new ServiceInfo(pi"+i+"Tag,[],[],piAddresses["+(i-2)+"],piPorts["+(i-2)+"])")
}*/


let isQPROP     = process.argv[2] == "true"
let toSpawn     = mapToName(process.argv[3])
let dataRate    = parseInt(process.argv[4]) / 10
let totalVals   = dataRate * 30
let csvFile     = process.argv[5]
let changes     = parseInt(process.argv[6])

function getRandomPi(lesserBound,upperbound){
    let index = Math.floor(Math.random() * piIds.length) + 2
    //return eval("pi"+index)
    if(index <= lesserBound || index >= upperbound){
        return getRandomPi(lesserBound,upperbound)
    }
    else{
        return index
    }
}

let dynLinks = []
for(var i=0;i < changes;i++){
    let fromIndex = getRandomPi(2,58)
    //let toIndex   = fromIndex + Math.floor(Math.random() * (59 - fromIndex)) + 1
    let toIndex = 1
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
}

switch (toSpawn){
    case "admitter":
        new Admitter(totalVals,csvFile,dataRate,10,dynLinks,changes)
        break
    case "monitor":
        new ServiceMonitor(monitorIP,monitorPort)
        break
    case "pi2":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi2.address,pi2.port,pi2.tag,pi2.parents,pi2.children,dynLinks,changes)
        break;
    case "pi3":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi3.address,pi3.port,pi3.tag,pi3.parents,pi3.children,[],changes)
        break;
    case "pi4":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi4.address,pi4.port,pi4.tag,pi4.parents,pi4.children,[],changes)
        break;
    case "pi5":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi5.address,pi5.port,pi5.tag,pi5.parents,pi5.children,[],changes)
        break;
    case "pi6":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi6.address,pi6.port,pi6.tag,pi6.parents,pi6.children,[],changes)
        break;
    case "pi7":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi7.address,pi7.port,pi7.tag,pi7.parents,pi7.children,[],changes)
        break;
    case "pi8":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi8.address,pi8.port,pi8.tag,pi8.parents,pi8.children,[],changes)
        break;
    case "pi9":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi9.address,pi9.port,pi9.tag,pi9.parents,pi9.children,[],changes)
        break;
    case "pi10":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi10.address,pi10.port,pi10.tag,pi10.parents,pi10.children,[],changes)
        break;
    case "pi11":
        new SourceService(isQPROP,dataRate,totalVals,csvFile,pi11.address,pi11.port,pi11.tag,pi11.parents,pi11.children,[],changes)
        break;
    case "pi12":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi12.address,pi12.port,pi12.tag,pi12.parents,pi12.children, changes)
        break;
    case "pi13":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi13.address,pi13.port,pi13.tag,pi13.parents,pi13.children, changes)
        break;
    case "pi14":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi14.address,pi14.port,pi14.tag,pi14.parents,pi14.children, changes)
        break;
    case "pi15":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi15.address,pi15.port,pi15.tag,pi15.parents,pi15.children, changes)
        break;
    case "pi16":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi16.address,pi16.port,pi16.tag,pi16.parents,pi16.children, changes)
        break;
    case "pi17":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi17.address,pi17.port,pi17.tag,pi17.parents,pi17.children, changes)
        break;
    case "pi18":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi18.address,pi18.port,pi18.tag,pi18.parents,pi18.children, changes)
        break;
    case "pi19":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi19.address,pi19.port,pi19.tag,pi19.parents,pi19.children, changes)
        break;
    case "pi20":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi20.address,pi20.port,pi20.tag,pi20.parents,pi20.children, changes)
        break;
    case "pi21":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi21.address,pi21.port,pi21.tag,pi21.parents,pi21.children, changes)
        break;
    case "pi22":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi22.address,pi22.port,pi22.tag,pi22.parents,pi22.children, changes)
        break;
    case "pi23":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi23.address,pi23.port,pi23.tag,pi23.parents,pi23.children, changes)
        break;
    case "pi24":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi24.address,pi24.port,pi24.tag,pi24.parents,pi24.children, changes)
        break;
    case "pi25":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi25.address,pi25.port,pi25.tag,pi25.parents,pi25.children, changes)
        break;
    case "pi26":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi26.address,pi26.port,pi26.tag,pi26.parents,pi26.children, changes)
        break;
    case "pi27":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi27.address,pi27.port,pi27.tag,pi27.parents,pi27.children, changes)
        break;
    case "pi28":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi28.address,pi28.port,pi28.tag,pi28.parents,pi28.children, changes)
        break;
    case "pi29":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi29.address,pi29.port,pi29.tag,pi29.parents,pi29.children, changes)
        break;
    case "pi30":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi30.address,pi30.port,pi30.tag,pi30.parents,pi30.children, changes)
        break;
    case "pi31":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi31.address,pi31.port,pi31.tag,pi31.parents,pi31.children, changes)
        break;
    case "pi32":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi32.address,pi32.port,pi32.tag,pi32.parents,pi32.children, changes)
        break;
    case "pi33":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi33.address,pi33.port,pi33.tag,pi33.parents,pi33.children, changes)
        break;
    case "pi34":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi34.address,pi34.port,pi34.tag,pi34.parents,pi34.children, changes)
        break;
    case "pi35":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi35.address,pi35.port,pi35.tag,pi35.parents,pi35.children, changes)
        break;
    case "pi36":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi36.address,pi36.port,pi36.tag,pi36.parents,pi36.children, changes)
        break;
    case "pi37":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi37.address,pi37.port,pi37.tag,pi37.parents,pi37.children, changes)
        break;
    case "pi38":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi38.address,pi38.port,pi38.tag,pi38.parents,pi38.children, changes)
        break;
    case "pi39":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi39.address,pi39.port,pi39.tag,pi39.parents,pi39.children, changes)
        break;
    case "pi40":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi40.address,pi40.port,pi40.tag,pi40.parents,pi40.children, changes)
        break;
    case "pi41":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi41.address,pi41.port,pi41.tag,pi41.parents,pi41.children, changes)
        break;
    case "pi42":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi42.address,pi42.port,pi42.tag,pi42.parents,pi42.children, changes)
        break;
    case "pi43":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi43.address,pi43.port,pi43.tag,pi43.parents,pi43.children, changes)
        break;
    case "pi44":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi44.address,pi44.port,pi44.tag,pi44.parents,pi44.children, changes)
        break;
    case "pi45":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi45.address,pi45.port,pi45.tag,pi45.parents,pi45.children, changes)
        break;
    case "pi46":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi46.address,pi46.port,pi46.tag,pi46.parents,pi46.children, changes)
        break;
    case "pi47":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi47.address,pi47.port,pi47.tag,pi47.parents,pi47.children, changes)
        break;
    case "pi48":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi48.address,pi48.port,pi48.tag,pi48.parents,pi48.children, changes)
        break;
    case "pi49":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi49.address,pi49.port,pi49.tag,pi49.parents,pi49.children, changes)
        break;
    case "pi50":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi50.address,pi50.port,pi50.tag,pi50.parents,pi50.children, changes)
        break;
    case "pi51":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi51.address,pi51.port,pi51.tag,pi51.parents,pi51.children, changes)
        break;
    case "pi52":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi52.address,pi52.port,pi52.tag,pi52.parents,pi52.children, changes)
        break;
    case "pi53":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi53.address,pi53.port,pi53.tag,pi53.parents,pi53.children, changes)
        break;
    case "pi54":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi54.address,pi54.port,pi54.tag,pi54.parents,pi54.children, changes)
        break;
    case "pi55":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi55.address,pi55.port,pi55.tag,pi55.parents,pi55.children, changes)
        break;
    case "pi56":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi56.address,pi56.port,pi56.tag,pi56.parents,pi56.children, changes)
        break;
    case "pi57":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi57.address,pi57.port,pi57.tag,pi57.parents,pi57.children, changes)
        break;
    case "pi58":
        new DerivedService(isQPROP,dataRate,totalVals,csvFile,pi58.address,pi58.port,pi58.tag,pi58.parents,pi58.children, changes)
        break;
    case "pi59":
        new SinkService(isQPROP,dataRate,totalVals,csvFile,pi59.address,pi59.port,pi59.tag,pi59.parents,pi59.children,10,changes)
        break;
    default:
        throw new Error("unknown spawning argument")
}
