var fs = require("fs")
var regularQPROP = fs.createWriteStream('RunRegularQPROPDynamicBench.sh')
var regularSIDUP = fs.createWriteStream('RunRegularSIDUPDynamicBench.sh')
regularQPROP.write("for i in {1..10}\n" +
    "do\n" +
    "\tnode DynamicRegular.js true monitor 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi2 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi3 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi4 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi5 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi6 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi7 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi8 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi9 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi10 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi11 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi12 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi13 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi14 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi15 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi16 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi17 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi18 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi19 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi20 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi21 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi22 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi23 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi24 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi25 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi26 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi27 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi28 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi29 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi30 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi31 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi32 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi33 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi34 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi35 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi36 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi37 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi38 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi39 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi40 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi41 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi42 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi43 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi44 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi45 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi46 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi47 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi48 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi49 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi50 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi51 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi52 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi53 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi54 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi55 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi56 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi57 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi58 2 qpropRegular 5 &\n" +
    "\tnode DynamicRegular.js true pi59 2 qpropRegular \n" +
    "\t sleep 5\n" +
    "done\n")
regularSIDUP.write("for i in {1..10}\n" +
    "do\n" +
    "\tnode DynamicRegular.js false admitter 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false monitor 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi2 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi3 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi4 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi5 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi6 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi7 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi8 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi9 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi10 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi11 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi12 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi13 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi14 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi15 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi16 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi17 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi18 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi19 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi20 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi21 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi22 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi23 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi24 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi25 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi26 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi27 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi28 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi29 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi30 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi31 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi32 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi33 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi34 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi35 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi36 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi37 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi38 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi39 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi40 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi41 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi42 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi43 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi44 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi45 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi46 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi47 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi48 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi49 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi50 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi51 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi52 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi53 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi54 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi55 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi56 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi57 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi58 2 sidupRegular 5 &\n" +
    "\tnode DynamicRegular.js false pi59 2 sidupRegular \n" +
    "\t sleep 5\n" +
    "done\n")
regularQPROP.end()
regularSIDUP.end()

/*for(var i=2;i<60;i++){
    console.log("\"\\tnode Fan.js true pi"+i+" 2 qpropFan &\\n\" +")
}*/

/*for(var i=2;i<60;i++){
    console.log("\"\\tnode Fan.js false pi"+i+" 2 sidupFan &\\n\" +")
}*/