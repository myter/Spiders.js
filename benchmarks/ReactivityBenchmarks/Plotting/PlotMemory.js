var plotly = require('plotly')("fmyter", "2vS7PnPW9rby030FBL2L");
var fss = require('fs');
var csv = require('fast-csv');
var Stats = require('fast-stats').Stats;
var xVals = ["Data", "Driving", "Geo", "Dash"];
let qpropNodeNames = ["Data", "Driving", "Geo", "Dashboard"];
let sidupNodeNames = qpropNodeNames.concat("Admitter");
let getMemoryData = (prefix, fileIndex) => {
    //TODO need to add config for real version
    let names;
    if (prefix == "qprop") {
        names = qpropNodeNames;
    }
    else {
        names = sidupNodeNames;
    }
    let results = names.map((nodeName) => {
        return new Promise((resolve) => {
            var stream = fss.createReadStream("../UseCase/TestBackup/Memory/" + prefix + fileIndex + nodeName + "Memory.csv");
            let allData = [];
            var csvStream = csv()
                .on("data", function (data) {
                allData.push(parseInt(data[0]));
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
getMemoryData("qprop", 301).then((results) => {
    let qpropData = {
        x: xVals,
        y: results.map(([res, error]) => { return res; }),
        name: "QPROP",
        type: "bar"
    };
    let qpropErrors = results.map(([res, error]) => { return error; });
    //TODO get SIDUP data as well
    let layout = {};
    let figure = {
        data: [qpropData]
    };
    let imgOpts = {
        format: 'pdf',
        width: 1000,
        height: 500
    };
    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error)
            return console.log(error);
        var fileStream = fss.createWriteStream('memory.pdf');
        imageStream.pipe(fileStream);
    });
});
//# sourceMappingURL=PlotMemory.js.map