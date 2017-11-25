var fs = require('fs');
var qpropScript = fs.createWriteStream('RunQPROPMTBench.sh');
for (var i = 0; i <= 10000; i += 1000) {
    if (i == 2) {
        qpropScript.write("for i in {1..30}\n" +
            "do\n" +
            "\tnode MaxThroughput.js true monitor " + 2 + " qprop &\n" +
            "\tnode MaxThroughput.js true data " + 2 + " qprop &\n" +
            "\tnode MaxThroughput.js true config " + 2 + " qprop &\n" +
            "\tnode MaxThroughput.js true driving " + 2 + " qprop &\n" +
            "\tnode MaxThroughput.js true geo " + 2 + " qprop &\n" +
            "\tnode MaxThroughput.js true dash " + 2 + " qprop\n" +
            "done\n");
    }
    else {
        qpropScript.write("for i in {1..30}\n" +
            "do\n" +
            "\tnode MaxThroughput.js true monitor " + i + " qprop &\n" +
            "\tnode MaxThroughput.js true data " + i + " qprop &\n" +
            "\tnode MaxThroughput.js true config " + i + " qprop &\n" +
            "\tnode MaxThroughput.js true driving " + i + " qprop &\n" +
            "\tnode MaxThroughput.js true geo " + i + " qprop &\n" +
            "\tnode MaxThroughput.js true dash " + i + " qprop\n" +
            "done\n");
    }
}
qpropScript.end();
//# sourceMappingURL=GenerateMTBashScript.js.map