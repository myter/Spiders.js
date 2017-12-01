export {}
var plotly = require('plotly')("fmyter", "2vS7PnPW9rby030FBL2L");
var fss = require('fs')
var csv = require('fast-csv')
var Stats = require('fast-stats').Stats;

var xVals : string[] = []
for(var i = 0;i < 1100;i+=100){
    if(i == 0){
        xVals.push("1")
    }
    else{
        xVals.push(i.toString())
    }
}

let getAllData = (prefix,path,arrayIndex,fileIndex,resolver,valuesArray,errorArray) =>{
    return new Promise((resolve)=>{
        let stream
        if(fileIndex == 0){
            stream          = fss.createReadStream("../GeneralIsa/results/"+path+prefix+"Regular1.csv");
        }
        else{
            stream          = fss.createReadStream("../GeneralIsa/results/"+path+prefix+"Regular"+fileIndex+".csv");
        }
        let allData         = []
        var csvStream = csv()
            .on("data", function(data){
                allData.push(parseInt(data[0]))
            })
            .on("end", function(){
                let s = new Stats()
                s.push(allData)
                valuesArray[arrayIndex] = s.median()
                errorArray[arrayIndex] = s.moe()
                if(arrayIndex == 10){
                    resolver([valuesArray,errorArray])
                }
                else if(arrayIndex == 0){
                    return getAllData(prefix,path,arrayIndex+1,fileIndex+10,resolve,valuesArray,errorArray)
                }
                else{
                    return getAllData(prefix,path,arrayIndex+1,fileIndex+10,resolver,valuesArray,errorArray)
                }
            });
        stream.pipe(csvStream)
    })
}
//In the case of QPROP Latency = Processing time (given that values are immediately admitted to the dependency graph)
getAllData("qprop","Latency/",0,0,null,new Array(11),new Array(11)).then(([qpropValues,qpropError])=>{
    getAllData("sidup","Latency/",0,0,null,new Array(11),new Array(11)).then(([sidupValues,sidupError])=>{
        let qpropData = {
            x: xVals,
            y: qpropValues,
            error_y: {
                type: "data",
                array: qpropError,
                visible: true
            },
            name: "QPROP"
        }
        let sidupData = {
            x: xVals,
            y: sidupValues,
            error_y: {
                type: "data",
                array: sidupError,
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
            title: "Latency under Varying Load",
            xaxis: {
                title: "Load (requests/s)",
            },
            yaxis: {
                title: "Latency (ms)",
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

            var fileStream = fss.createWriteStream('latencyISA.pdf');
            imageStream.pipe(fileStream);
        });
    })
})