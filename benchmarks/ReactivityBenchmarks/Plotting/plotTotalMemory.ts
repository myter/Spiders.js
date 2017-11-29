export {}
var plotly = require('plotly')("fmyter", "2vS7PnPW9rby030FBL2L");
var fss = require('fs')
var csv = require('fast-csv')
var Stats = require('fast-stats').Stats;

var xVals : string[] = []
for(var i = 0;i < 310;i+=10){
    if(i == 0){
        xVals.push("1")
    }
    else{
        xVals.push(i.toString())
    }
}

let qpropNodeNames  = ["Data","Config","Driving","Geo","Dashboard"]
let sidupNodeNames  = qpropNodeNames.concat("Admitter")
let getMemoryData = (prefix,fileIndex) => {
    let names
    if(prefix == "qprop"){
        names = qpropNodeNames
    }
    else{
        names = sidupNodeNames
    }
    let results = names.map((nodeName)=>{
        return new Promise((resolve)=>{
            var stream          = fss.createReadStream("../UseCase/MemoryComplete/"+prefix+fileIndex+nodeName+"Memory.csv");
            let allData         = []
            var csvStream = csv()
                .on("data", function(data){
                    allData.push((parseInt(data[0]) + parseInt(data[1])))
                })
                .on("end", function(){
                    let s = new Stats()
                    s.push(allData)
                    resolve([s.median(),s.moe()])
                });
            stream.pipe(csvStream)
        })
    })
    return Promise.all(results).then((results)=>{
        let totalRes =  0
        let totalErrors = 0
        results.forEach(([res,error])=>{
            totalRes += res
            totalErrors += error
        })
        return [totalRes,totalErrors]
    })
}
let allLoads = []
for(var i = 0;i <= 300;i+=10){
    if(i ==0){
        allLoads.push(2)
    }
    else{
        allLoads.push(i)
    }
}
let allQPROPResults = allLoads.map((load)=>{
    return getMemoryData("qprop",load)
})
let allSIDUPResults = allLoads.map((load)=>{
    return getMemoryData("sidup",load)
})
Promise.all(allQPROPResults).then((qpropResults)=>{
    Promise.all(allSIDUPResults).then((sidupResults)=>{
        let qpropData = {
            x: xVals,
            y: qpropResults.map(([res,error])=>{return res}),
            error_y: {
                type: "data",
                array: qpropResults.map(([res,error])=>{return error}),
                visible: true
            },
            name: "QPROP"
        }
        let sidupData = {
            x: xVals,
            y: sidupResults.map(([res,error])=>{return res}),
            error_y: {
                type: "data",
                array: sidupResults.map(([res,error])=>{return error}),
                visible: true
            },
            name: "SID-UP"
        }
        let layout = {
            showlegend: true,
            legend: {
                x: 0,
                y: 1
            },
            title: "Processing Time under Varying Load",
            xaxis: {
                title: "Load (requests/s)",
                showline: true,
            },
        }
        let figure = {
            data: [qpropData,sidupData],
            layout : layout
        }
        let imgOpts = {
            format: 'pdf',
            width: 500,
            height: 500
        }
        plotly.getImage(figure, imgOpts, function (error, imageStream) {
            if (error) return console.log (error);

            var fileStream = fss.createWriteStream('totalMemory.pdf');
            imageStream.pipe(fileStream);
        });
    })
})