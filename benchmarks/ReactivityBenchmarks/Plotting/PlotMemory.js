var plotly = require('plotly')("fmyter", "2vS7PnPW9rby030FBL2L");
var fss = require('fs');
var csv = require('fast-csv');
var Stats = require('fast-stats').Stats;
var xVals = ["Data", "Config", "Driving", "Geo", "Dash"];
let qpropNodeNames = ["Data", "Config", "Driving", "Geo", "Dashboard"];
let sidupNodeNames = qpropNodeNames; //.concat("Admitter")
let getMemoryData = (prefix, fileIndex) => {
    let names;
    if (prefix == "qprop") {
        names = qpropNodeNames;
    }
    else {
        names = sidupNodeNames;
    }
    let results = names.map((nodeName) => {
        return new Promise((resolve) => {
            var stream = fss.createReadStream("../UseCase/BerthaResults/Memory/" + prefix + fileIndex + nodeName + "Memory.csv");
            let allData = [];
            var csvStream = csv()
                .on("data", function (data) {
                allData.push((parseInt(data[0]) + parseInt(data[1])));
            })
                .on("end", function () {
                let s = new Stats();
                s.push(allData);
                resolve([s.median(), s.moe()]);
            });
            stream.pipe(csvStream);
        });
    });
    return Promise.all(results);
};
getMemoryData("qprop", 300).then((qpropResults) => {
    getMemoryData("sidup", 300).then((sidupResults) => {
        let qpropData = {
            x: xVals,
            y: qpropResults.map(([res, error]) => { return res; }),
            error_y: {
                type: "data",
                array: qpropResults.map(([res, error]) => { return error; }),
                visible: true
            },
            name: "QPROP",
            type: "bar"
        };
        let sidupData = {
            x: xVals,
            y: sidupResults.map(([res, error]) => { return res; }),
            error_y: {
                type: "data",
                array: sidupResults.map(([res, error]) => { return error; }),
                visible: true
            },
            name: "SID-UP",
            type: "bar"
        };
        //let qpropErrors = results.map(([res,error])=>{return error})
        let figure = {
            data: [qpropData, sidupData]
        };
        let imgOpts = {
            format: 'pdf',
            width: 500,
            height: 500
        };
        plotly.getImage(figure, imgOpts, function (error, imageStream) {
            if (error)
                return console.log(error);
            var fileStream = fss.createWriteStream('memory.pdf');
            imageStream.pipe(fileStream);
        });
    });
});
//# sourceMappingURL=PlotMemory.js.map