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
var qpropYVals = new Array(30)
var qpropError = new Array(30)
let getAllData = (prefix,arrayIndex,fileIndex,resolver) =>{
    return new Promise((resolve)=>{
        //TODO this will need to change when running for real
        if(fileIndex == 0){
            fileIndex++
        }
        var stream          = fss.createReadStream("../UseCase/TestBackup/Responsiveness/"+prefix+fileIndex+".csv");
        let allData         = []
        var csvStream = csv()
            .on("data", function(data){
                allData.push(parseInt(data[0]))
            })
            .on("end", function(){
                let s = new Stats()
                s.push(allData)
                qpropYVals[arrayIndex] = s.median()
                qpropError[arrayIndex] = s.moe()
                if(arrayIndex == 30){
                    resolver()
                }
                else if(arrayIndex == 0){
                    return getAllData(prefix,arrayIndex+1,fileIndex+10,resolve)
                }
                else{
                   return getAllData(prefix,arrayIndex+1,fileIndex+10,resolver)
                }
            });
        stream.pipe(csvStream)
    })
}
getAllData("qprop",0,0,null).then(()=>{
    let qpropData = {
        x: xVals,
        y: qpropYVals,
        error_y: {
            type: "data",
            array: qpropError,
            visible: true
        },
        name: "QPROP"
    }
    let otherData = {
        x: xVals,
        y: qpropYVals.map((v)=>{return v + 50}),
        name: "WUT"
    }
    let layout = {
        showlegend: true,
        legend: {
            x: 0,
            y: 1
        },
        title: "Responsiveness",
        xaxis: {
            title: "Load (requests/s)",
            /*titlefont: {
                family: "Courier New, monospace",
                size: 18,
                color: "#7f7f7f"
            }*/
        },
        yaxis: {
            title: "Response Time(ms)",
            /*titlefont: {
                family: "Courier New, monospace",
                size: 18,
                color: "#7f7f7f"
            }*/
        },
        annotations: [
            {
                x:45,
                y:50,
                xref: "x",
                yref: "y",
                text: "Weekend load",
                showarrow: true,
                arrowhead: 1,
                ax: 0,
                ay: -40
            }
        ]
    }
    let figure = {
        data: [qpropData,otherData],
        layout : layout
    }
    let imgOpts = {
        format: 'pdf',
        width: 1000,
        height: 500
    }
    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error) return console.log (error);

        var fileStream = fss.createWriteStream('responsiveness.pdf');
        imageStream.pipe(fileStream);
    });
})