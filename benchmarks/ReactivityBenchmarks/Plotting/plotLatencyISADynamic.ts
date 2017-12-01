export{}
var plotly = require('plotly')("fmyter", "2vS7PnPW9rby030FBL2L");
var fss = require('fs')
var csv = require('fast-csv')
var Stats = require('fast-stats').Stats;

var xVals : string[] = []
for(var i = 0;i < 25;i+=5){
    if(i == 0){
        xVals.push("1")
    }
    else{
        xVals.push(i.toString())
    }
}

let getAllData = (prefix,arrayIndex,fileIndex,resolver,valuesArray,errorArray) =>{
    return new Promise((resolve)=>{
        let stream
        if(fileIndex == 0){
            stream          = fss.createReadStream("../GeneralIsa/resultsDynamic/Latency/"+prefix+"Regular1.csv");
        }
        else{
            stream          = fss.createReadStream("../GeneralIsa/resultsDynamic/Latency/"+prefix+"Regular"+fileIndex+".csv");
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
                if(arrayIndex == 4){
                    resolver([valuesArray,errorArray])
                }
                else if(arrayIndex == 0){
                    return getAllData(prefix,arrayIndex+1,fileIndex+5,resolve,valuesArray,errorArray)
                }
                else{
                    return getAllData(prefix,arrayIndex+1,fileIndex+5,resolver,valuesArray,errorArray)
                }
            });
        stream.pipe(csvStream)
    })
}
getAllData("qprop",0,0,null,new Array(5),new Array(5)).then(([qpropValues,qpropError])=>{
    getAllData("sidup",0,0,null,new Array(5),new Array(5)).then(([sidupValues,sidupError])=>{
        console.log(qpropValues)
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
            y: sidupValues,error_y: {
                type: "data",
                array: sidupError,
                visible: true
            },
            name: "SID-UP"
        }
        let layout = {
            showlegend: true,
            legend: {
                x: 1,
                y: 1
            },
            title: "Latency under Varying Dynamic Topology Changes",
            xaxis: {
                title: "Topolgy Changes",
                range:[0,22]
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

            var fileStream = fss.createWriteStream('latencyISADynamic.pdf');
            imageStream.pipe(fileStream);
        });
    })
})