var fs = require('fs');
var qpropScript = fs.createWriteStream('RunQPROPMTBench.sh')
for(var i =0;i <= 10000;i+=1000){
    if(i == 0){
        qpropScript.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true monitor "+2+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true data "+2+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true config "+2+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true driving "+2+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true geo "+2+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true dash "+2+" qprop\n" +
            "\t sleep 5\n" +
            "done\n")
    }
    else{
        qpropScript.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true monitor "+i+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true data "+i+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true config "+i+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true driving "+i+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true geo "+i+" qprop &\n" +
            "\tnode --max_old_space_size=12000 MaxThroughput.js true dash "+i+" qprop\n" +
            "\t sleep 5\n" +
            "done\n")
    }
}
qpropScript.end()
