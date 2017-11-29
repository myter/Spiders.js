var fs = require('fs');
var qpropScript = fs.createWriteStream('RunQPROPBench.sh')
var sidupScript = fs.createWriteStream('RunSIDUPBench.sh')
for(var i =0;i <= 300;i+=10){
    if(i == 0){
        qpropScript.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode RunUseCase.js true monitor "+2+" qprop &\n" +
            "\tnode RunUseCase.js true data "+2+" qprop &\n" +
            "\tnode RunUseCase.js true config "+2+" qprop &\n" +
            "\tnode RunUseCase.js true driving "+2+" qprop &\n" +
            "\tnode RunUseCase.js true geo "+2+" qprop &\n" +
            "\tnode RunUseCase.js true dash "+2+" qprop\n" +
            "\t sleep 5\n" +
            "done\n")
        sidupScript.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode RunUseCase.js false admitter "+2+" sidup &\n" +
            "\tnode RunUseCase.js false monitor "+2+" sidup &\n" +
            "\tnode RunUseCase.js false data "+2+" sidup &\n" +
            "\tnode RunUseCase.js false config "+2+" sidup &\n" +
            "\tnode RunUseCase.js false driving "+2+" sidup &\n" +
            "\tnode RunUseCase.js false geo "+2+" sidup &\n" +
            "\tnode RunUseCase.js false dash "+2+" sidup\n" +
            "\t sleep 5\n" +
            "done\n")
    }
    else{
        qpropScript.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode RunUseCase.js true monitor "+i+" qprop &\n" +
            "\tnode RunUseCase.js true data "+i+" qprop &\n" +
            "\tnode RunUseCase.js true config "+i+" qprop &\n" +
            "\tnode RunUseCase.js true driving "+i+" qprop &\n" +
            "\tnode RunUseCase.js true geo "+i+" qprop &\n" +
            "\tnode RunUseCase.js true dash "+i+" qprop\n" +
            "\t sleep 5\n" +
            "done\n")
        sidupScript.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode RunUseCase.js false admitter "+i+" sidup &\n" +
            "\tnode RunUseCase.js false monitor "+i+" sidup &\n" +
            "\tnode RunUseCase.js false data "+i+" sidup &\n" +
            "\tnode RunUseCase.js false config "+i+" sidup &\n" +
            "\tnode RunUseCase.js false driving "+i+" sidup &\n" +
            "\tnode RunUseCase.js false geo "+i+" sidup &\n" +
            "\tnode RunUseCase.js false dash "+i+" sidup\n" +
            "\t sleep 5\n" +
            "done\n")
    }
}
qpropScript.end()
sidupScript.end()