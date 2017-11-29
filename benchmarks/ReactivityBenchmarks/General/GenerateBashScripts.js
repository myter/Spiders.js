var fs = require("fs");
var fanQPROP = fs.createWriteStream('RunFanQPROPBench.sh');
var fanSIDUP = fs.createWriteStream('RunFanSIDUPBench.sh');
var chainQPROP = fs.createWriteStream('RunChainQPROPBench.sh');
var chainSIDUP = fs.createWriteStream('RunChainSIDUPBench.sh');
var regularQPROP = fs.createWriteStream('RunRegularQPROPBench.sh');
var regularSIDUP = fs.createWriteStream('RunRegularSIDUPBench.sh');
fanQPROP.write("for i in {1..10}\n" +
    "do\n" +
    "\tnode Fan.js true monitor 2 qpropFan &\n" +
    "\tnode Fan.js true pi2 2 qpropFan &\n" +
    "\tnode Fan.js true pi3 2 qpropFan &\n" +
    "\tnode Fan.js true pi4 2 qpropFan &\n" +
    "\tnode Fan.js true pi5 2 qpropFan &\n" +
    "\tnode Fan.js true pi6 2 qpropFan &\n" +
    "\tnode Fan.js true pi7 2 qpropFan &\n" +
    "\tnode Fan.js true pi8 2 qpropFan &\n" +
    "\tnode Fan.js true pi9 2 qpropFan &\n" +
    "\tnode Fan.js true pi10 2 qpropFan &\n" +
    "\tnode Fan.js true pi11 2 qpropFan &\n" +
    "\tnode Fan.js true pi12 2 qpropFan &\n" +
    "\tnode Fan.js true pi13 2 qpropFan &\n" +
    "\tnode Fan.js true pi14 2 qpropFan &\n" +
    "\tnode Fan.js true pi15 2 qpropFan &\n" +
    "\tnode Fan.js true pi16 2 qpropFan &\n" +
    "\tnode Fan.js true pi17 2 qpropFan &\n" +
    "\tnode Fan.js true pi18 2 qpropFan &\n" +
    "\tnode Fan.js true pi19 2 qpropFan &\n" +
    "\tnode Fan.js true pi20 2 qpropFan &\n" +
    "\tnode Fan.js true pi21 2 qpropFan &\n" +
    "\tnode Fan.js true pi22 2 qpropFan &\n" +
    "\tnode Fan.js true pi23 2 qpropFan &\n" +
    "\tnode Fan.js true pi24 2 qpropFan &\n" +
    "\tnode Fan.js true pi25 2 qpropFan &\n" +
    "\tnode Fan.js true pi26 2 qpropFan &\n" +
    "\tnode Fan.js true pi27 2 qpropFan &\n" +
    "\tnode Fan.js true pi28 2 qpropFan &\n" +
    "\tnode Fan.js true pi29 2 qpropFan &\n" +
    "\tnode Fan.js true pi30 2 qpropFan &\n" +
    "\tnode Fan.js true pi31 2 qpropFan &\n" +
    "\tnode Fan.js true pi32 2 qpropFan &\n" +
    "\tnode Fan.js true pi33 2 qpropFan &\n" +
    "\tnode Fan.js true pi34 2 qpropFan &\n" +
    "\tnode Fan.js true pi35 2 qpropFan &\n" +
    "\tnode Fan.js true pi36 2 qpropFan &\n" +
    "\tnode Fan.js true pi37 2 qpropFan &\n" +
    "\tnode Fan.js true pi38 2 qpropFan &\n" +
    "\tnode Fan.js true pi39 2 qpropFan &\n" +
    "\tnode Fan.js true pi40 2 qpropFan &\n" +
    "\tnode Fan.js true pi41 2 qpropFan &\n" +
    "\tnode Fan.js true pi42 2 qpropFan &\n" +
    "\tnode Fan.js true pi43 2 qpropFan &\n" +
    "\tnode Fan.js true pi44 2 qpropFan &\n" +
    "\tnode Fan.js true pi45 2 qpropFan &\n" +
    "\tnode Fan.js true pi46 2 qpropFan &\n" +
    "\tnode Fan.js true pi47 2 qpropFan &\n" +
    "\tnode Fan.js true pi48 2 qpropFan &\n" +
    "\tnode Fan.js true pi49 2 qpropFan &\n" +
    "\tnode Fan.js true pi50 2 qpropFan &\n" +
    "\tnode Fan.js true pi51 2 qpropFan &\n" +
    "\tnode Fan.js true pi52 2 qpropFan &\n" +
    "\tnode Fan.js true pi53 2 qpropFan &\n" +
    "\tnode Fan.js true pi54 2 qpropFan &\n" +
    "\tnode Fan.js true pi55 2 qpropFan &\n" +
    "\tnode Fan.js true pi56 2 qpropFan &\n" +
    "\tnode Fan.js true pi57 2 qpropFan &\n" +
    "\tnode Fan.js true pi58 2 qpropFan &\n" +
    "\tnode Fan.js true pi59 2 qpropFan \n" +
    "\t sleep 5\n" +
    "done\n");
fanSIDUP.write("for i in {1..10}\n" +
    "do\n" +
    "\tnode Fan.js false admitter 2 sidupFan &\n" +
    "\tnode Fan.js false monitor 2 sidupFan &\n" +
    "\tnode Fan.js false pi2 2 sidupFan &\n" +
    "\tnode Fan.js false pi3 2 sidupFan &\n" +
    "\tnode Fan.js false pi4 2 sidupFan &\n" +
    "\tnode Fan.js false pi5 2 sidupFan &\n" +
    "\tnode Fan.js false pi6 2 sidupFan &\n" +
    "\tnode Fan.js false pi7 2 sidupFan &\n" +
    "\tnode Fan.js false pi8 2 sidupFan &\n" +
    "\tnode Fan.js false pi9 2 sidupFan &\n" +
    "\tnode Fan.js false pi10 2 sidupFan &\n" +
    "\tnode Fan.js false pi11 2 sidupFan &\n" +
    "\tnode Fan.js false pi12 2 sidupFan &\n" +
    "\tnode Fan.js false pi13 2 sidupFan &\n" +
    "\tnode Fan.js false pi14 2 sidupFan &\n" +
    "\tnode Fan.js false pi15 2 sidupFan &\n" +
    "\tnode Fan.js false pi16 2 sidupFan &\n" +
    "\tnode Fan.js false pi17 2 sidupFan &\n" +
    "\tnode Fan.js false pi18 2 sidupFan &\n" +
    "\tnode Fan.js false pi19 2 sidupFan &\n" +
    "\tnode Fan.js false pi20 2 sidupFan &\n" +
    "\tnode Fan.js false pi21 2 sidupFan &\n" +
    "\tnode Fan.js false pi22 2 sidupFan &\n" +
    "\tnode Fan.js false pi23 2 sidupFan &\n" +
    "\tnode Fan.js false pi24 2 sidupFan &\n" +
    "\tnode Fan.js false pi25 2 sidupFan &\n" +
    "\tnode Fan.js false pi26 2 sidupFan &\n" +
    "\tnode Fan.js false pi27 2 sidupFan &\n" +
    "\tnode Fan.js false pi28 2 sidupFan &\n" +
    "\tnode Fan.js false pi29 2 sidupFan &\n" +
    "\tnode Fan.js false pi30 2 sidupFan &\n" +
    "\tnode Fan.js false pi31 2 sidupFan &\n" +
    "\tnode Fan.js false pi32 2 sidupFan &\n" +
    "\tnode Fan.js false pi33 2 sidupFan &\n" +
    "\tnode Fan.js false pi34 2 sidupFan &\n" +
    "\tnode Fan.js false pi35 2 sidupFan &\n" +
    "\tnode Fan.js false pi36 2 sidupFan &\n" +
    "\tnode Fan.js false pi37 2 sidupFan &\n" +
    "\tnode Fan.js false pi38 2 sidupFan &\n" +
    "\tnode Fan.js false pi39 2 sidupFan &\n" +
    "\tnode Fan.js false pi40 2 sidupFan &\n" +
    "\tnode Fan.js false pi41 2 sidupFan &\n" +
    "\tnode Fan.js false pi42 2 sidupFan &\n" +
    "\tnode Fan.js false pi43 2 sidupFan &\n" +
    "\tnode Fan.js false pi44 2 sidupFan &\n" +
    "\tnode Fan.js false pi45 2 sidupFan &\n" +
    "\tnode Fan.js false pi46 2 sidupFan &\n" +
    "\tnode Fan.js false pi47 2 sidupFan &\n" +
    "\tnode Fan.js false pi48 2 sidupFan &\n" +
    "\tnode Fan.js false pi49 2 sidupFan &\n" +
    "\tnode Fan.js false pi50 2 sidupFan &\n" +
    "\tnode Fan.js false pi51 2 sidupFan &\n" +
    "\tnode Fan.js false pi52 2 sidupFan &\n" +
    "\tnode Fan.js false pi53 2 sidupFan &\n" +
    "\tnode Fan.js false pi54 2 sidupFan &\n" +
    "\tnode Fan.js false pi55 2 sidupFan &\n" +
    "\tnode Fan.js false pi56 2 sidupFan &\n" +
    "\tnode Fan.js false pi57 2 sidupFan &\n" +
    "\tnode Fan.js false pi58 2 sidupFan &\n" +
    "\tnode Fan.js false pi59 2 sidupFan \n" +
    "\t sleep 5\n" +
    "done\n");
fanQPROP.end();
fanSIDUP.end();
chainQPROP.write("for i in {1..10}\n" +
    "do\n" +
    "\tnode Chain.js true monitor 2 qpropChain &\n" +
    "\tnode Chain.js true pi2 2 qpropChain &\n" +
    "\tnode Chain.js true pi3 2 qpropChain &\n" +
    "\tnode Chain.js true pi4 2 qpropChain &\n" +
    "\tnode Chain.js true pi5 2 qpropChain &\n" +
    "\tnode Chain.js true pi6 2 qpropChain &\n" +
    "\tnode Chain.js true pi7 2 qpropChain &\n" +
    "\tnode Chain.js true pi8 2 qpropChain &\n" +
    "\tnode Chain.js true pi9 2 qpropChain &\n" +
    "\tnode Chain.js true pi10 2 qpropChain &\n" +
    "\tnode Chain.js true pi11 2 qpropChain &\n" +
    "\tnode Chain.js true pi12 2 qpropChain &\n" +
    "\tnode Chain.js true pi13 2 qpropChain &\n" +
    "\tnode Chain.js true pi14 2 qpropChain &\n" +
    "\tnode Chain.js true pi15 2 qpropChain &\n" +
    "\tnode Chain.js true pi16 2 qpropChain &\n" +
    "\tnode Chain.js true pi17 2 qpropChain &\n" +
    "\tnode Chain.js true pi18 2 qpropChain &\n" +
    "\tnode Chain.js true pi19 2 qpropChain &\n" +
    "\tnode Chain.js true pi20 2 qpropChain &\n" +
    "\tnode Chain.js true pi21 2 qpropChain &\n" +
    "\tnode Chain.js true pi22 2 qpropChain &\n" +
    "\tnode Chain.js true pi23 2 qpropChain &\n" +
    "\tnode Chain.js true pi24 2 qpropChain &\n" +
    "\tnode Chain.js true pi25 2 qpropChain &\n" +
    "\tnode Chain.js true pi26 2 qpropChain &\n" +
    "\tnode Chain.js true pi27 2 qpropChain &\n" +
    "\tnode Chain.js true pi28 2 qpropChain &\n" +
    "\tnode Chain.js true pi29 2 qpropChain &\n" +
    "\tnode Chain.js true pi30 2 qpropChain &\n" +
    "\tnode Chain.js true pi31 2 qpropChain &\n" +
    "\tnode Chain.js true pi32 2 qpropChain &\n" +
    "\tnode Chain.js true pi33 2 qpropChain &\n" +
    "\tnode Chain.js true pi34 2 qpropChain &\n" +
    "\tnode Chain.js true pi35 2 qpropChain &\n" +
    "\tnode Chain.js true pi36 2 qpropChain &\n" +
    "\tnode Chain.js true pi37 2 qpropChain &\n" +
    "\tnode Chain.js true pi38 2 qpropChain &\n" +
    "\tnode Chain.js true pi39 2 qpropChain &\n" +
    "\tnode Chain.js true pi40 2 qpropChain &\n" +
    "\tnode Chain.js true pi41 2 qpropChain &\n" +
    "\tnode Chain.js true pi42 2 qpropChain &\n" +
    "\tnode Chain.js true pi43 2 qpropChain &\n" +
    "\tnode Chain.js true pi44 2 qpropChain &\n" +
    "\tnode Chain.js true pi45 2 qpropChain &\n" +
    "\tnode Chain.js true pi46 2 qpropChain &\n" +
    "\tnode Chain.js true pi47 2 qpropChain &\n" +
    "\tnode Chain.js true pi48 2 qpropChain &\n" +
    "\tnode Chain.js true pi49 2 qpropChain &\n" +
    "\tnode Chain.js true pi50 2 qpropChain &\n" +
    "\tnode Chain.js true pi51 2 qpropChain &\n" +
    "\tnode Chain.js true pi52 2 qpropChain &\n" +
    "\tnode Chain.js true pi53 2 qpropChain &\n" +
    "\tnode Chain.js true pi54 2 qpropChain &\n" +
    "\tnode Chain.js true pi55 2 qpropChain &\n" +
    "\tnode Chain.js true pi56 2 qpropChain &\n" +
    "\tnode Chain.js true pi57 2 qpropChain &\n" +
    "\tnode Chain.js true pi58 2 qpropChain &\n" +
    "\tnode Chain.js true pi59 2 qpropChain \n" +
    "\t sleep 5\n" +
    "done\n");
chainSIDUP.write("for i in {1..10}\n" +
    "do\n" +
    "\tnode Chain.js false admitter 2 sidupChain &\n" +
    "\tnode Chain.js false monitor 2 sidupChain &\n" +
    "\tnode Chain.js false pi2 2 sidupChain &\n" +
    "\tnode Chain.js false pi3 2 sidupChain &\n" +
    "\tnode Chain.js false pi4 2 sidupChain &\n" +
    "\tnode Chain.js false pi5 2 sidupChain &\n" +
    "\tnode Chain.js false pi6 2 sidupChain &\n" +
    "\tnode Chain.js false pi7 2 sidupChain &\n" +
    "\tnode Chain.js false pi8 2 sidupChain &\n" +
    "\tnode Chain.js false pi9 2 sidupChain &\n" +
    "\tnode Chain.js false pi10 2 sidupChain &\n" +
    "\tnode Chain.js false pi11 2 sidupChain &\n" +
    "\tnode Chain.js false pi12 2 sidupChain &\n" +
    "\tnode Chain.js false pi13 2 sidupChain &\n" +
    "\tnode Chain.js false pi14 2 sidupChain &\n" +
    "\tnode Chain.js false pi15 2 sidupChain &\n" +
    "\tnode Chain.js false pi16 2 sidupChain &\n" +
    "\tnode Chain.js false pi17 2 sidupChain &\n" +
    "\tnode Chain.js false pi18 2 sidupChain &\n" +
    "\tnode Chain.js false pi19 2 sidupChain &\n" +
    "\tnode Chain.js false pi20 2 sidupChain &\n" +
    "\tnode Chain.js false pi21 2 sidupChain &\n" +
    "\tnode Chain.js false pi22 2 sidupChain &\n" +
    "\tnode Chain.js false pi23 2 sidupChain &\n" +
    "\tnode Chain.js false pi24 2 sidupChain &\n" +
    "\tnode Chain.js false pi25 2 sidupChain &\n" +
    "\tnode Chain.js false pi26 2 sidupChain &\n" +
    "\tnode Chain.js false pi27 2 sidupChain &\n" +
    "\tnode Chain.js false pi28 2 sidupChain &\n" +
    "\tnode Chain.js false pi29 2 sidupChain &\n" +
    "\tnode Chain.js false pi30 2 sidupChain &\n" +
    "\tnode Chain.js false pi31 2 sidupChain &\n" +
    "\tnode Chain.js false pi32 2 sidupChain &\n" +
    "\tnode Chain.js false pi33 2 sidupChain &\n" +
    "\tnode Chain.js false pi34 2 sidupChain &\n" +
    "\tnode Chain.js false pi35 2 sidupChain &\n" +
    "\tnode Chain.js false pi36 2 sidupChain &\n" +
    "\tnode Chain.js false pi37 2 sidupChain &\n" +
    "\tnode Chain.js false pi38 2 sidupChain &\n" +
    "\tnode Chain.js false pi39 2 sidupChain &\n" +
    "\tnode Chain.js false pi40 2 sidupChain &\n" +
    "\tnode Chain.js false pi41 2 sidupChain &\n" +
    "\tnode Chain.js false pi42 2 sidupChain &\n" +
    "\tnode Chain.js false pi43 2 sidupChain &\n" +
    "\tnode Chain.js false pi44 2 sidupChain &\n" +
    "\tnode Chain.js false pi45 2 sidupChain &\n" +
    "\tnode Chain.js false pi46 2 sidupChain &\n" +
    "\tnode Chain.js false pi47 2 sidupChain &\n" +
    "\tnode Chain.js false pi48 2 sidupChain &\n" +
    "\tnode Chain.js false pi49 2 sidupChain &\n" +
    "\tnode Chain.js false pi50 2 sidupChain &\n" +
    "\tnode Chain.js false pi51 2 sidupChain &\n" +
    "\tnode Chain.js false pi52 2 sidupChain &\n" +
    "\tnode Chain.js false pi53 2 sidupChain &\n" +
    "\tnode Chain.js false pi54 2 sidupChain &\n" +
    "\tnode Chain.js false pi55 2 sidupChain &\n" +
    "\tnode Chain.js false pi56 2 sidupChain &\n" +
    "\tnode Chain.js false pi57 2 sidupChain &\n" +
    "\tnode Chain.js false pi58 2 sidupChain &\n" +
    "\tnode Chain.js false pi59 2 sidupChain \n" +
    "\t sleep 5\n" +
    "done\n");
chainQPROP.end();
chainSIDUP.end();
regularQPROP.write("for i in {1..10}\n" +
    "do\n" +
    "\tnode Regular.js true monitor 2 qpropRegular &\n" +
    "\tnode Regular.js true pi2 2 qpropRegular &\n" +
    "\tnode Regular.js true pi3 2 qpropRegular &\n" +
    "\tnode Regular.js true pi4 2 qpropRegular &\n" +
    "\tnode Regular.js true pi5 2 qpropRegular &\n" +
    "\tnode Regular.js true pi6 2 qpropRegular &\n" +
    "\tnode Regular.js true pi7 2 qpropRegular &\n" +
    "\tnode Regular.js true pi8 2 qpropRegular &\n" +
    "\tnode Regular.js true pi9 2 qpropRegular &\n" +
    "\tnode Regular.js true pi10 2 qpropRegular &\n" +
    "\tnode Regular.js true pi11 2 qpropRegular &\n" +
    "\tnode Regular.js true pi12 2 qpropRegular &\n" +
    "\tnode Regular.js true pi13 2 qpropRegular &\n" +
    "\tnode Regular.js true pi14 2 qpropRegular &\n" +
    "\tnode Regular.js true pi15 2 qpropRegular &\n" +
    "\tnode Regular.js true pi16 2 qpropRegular &\n" +
    "\tnode Regular.js true pi17 2 qpropRegular &\n" +
    "\tnode Regular.js true pi18 2 qpropRegular &\n" +
    "\tnode Regular.js true pi19 2 qpropRegular &\n" +
    "\tnode Regular.js true pi20 2 qpropRegular &\n" +
    "\tnode Regular.js true pi21 2 qpropRegular &\n" +
    "\tnode Regular.js true pi22 2 qpropRegular &\n" +
    "\tnode Regular.js true pi23 2 qpropRegular &\n" +
    "\tnode Regular.js true pi24 2 qpropRegular &\n" +
    "\tnode Regular.js true pi25 2 qpropRegular &\n" +
    "\tnode Regular.js true pi26 2 qpropRegular &\n" +
    "\tnode Regular.js true pi27 2 qpropRegular &\n" +
    "\tnode Regular.js true pi28 2 qpropRegular &\n" +
    "\tnode Regular.js true pi29 2 qpropRegular &\n" +
    "\tnode Regular.js true pi30 2 qpropRegular &\n" +
    "\tnode Regular.js true pi31 2 qpropRegular &\n" +
    "\tnode Regular.js true pi32 2 qpropRegular &\n" +
    "\tnode Regular.js true pi33 2 qpropRegular &\n" +
    "\tnode Regular.js true pi34 2 qpropRegular &\n" +
    "\tnode Regular.js true pi35 2 qpropRegular &\n" +
    "\tnode Regular.js true pi36 2 qpropRegular &\n" +
    "\tnode Regular.js true pi37 2 qpropRegular &\n" +
    "\tnode Regular.js true pi38 2 qpropRegular &\n" +
    "\tnode Regular.js true pi39 2 qpropRegular &\n" +
    "\tnode Regular.js true pi40 2 qpropRegular &\n" +
    "\tnode Regular.js true pi41 2 qpropRegular &\n" +
    "\tnode Regular.js true pi42 2 qpropRegular &\n" +
    "\tnode Regular.js true pi43 2 qpropRegular &\n" +
    "\tnode Regular.js true pi44 2 qpropRegular &\n" +
    "\tnode Regular.js true pi45 2 qpropRegular &\n" +
    "\tnode Regular.js true pi46 2 qpropRegular &\n" +
    "\tnode Regular.js true pi47 2 qpropRegular &\n" +
    "\tnode Regular.js true pi48 2 qpropRegular &\n" +
    "\tnode Regular.js true pi49 2 qpropRegular &\n" +
    "\tnode Regular.js true pi50 2 qpropRegular &\n" +
    "\tnode Regular.js true pi51 2 qpropRegular &\n" +
    "\tnode Regular.js true pi52 2 qpropRegular &\n" +
    "\tnode Regular.js true pi53 2 qpropRegular &\n" +
    "\tnode Regular.js true pi54 2 qpropRegular &\n" +
    "\tnode Regular.js true pi55 2 qpropRegular &\n" +
    "\tnode Regular.js true pi56 2 qpropRegular &\n" +
    "\tnode Regular.js true pi57 2 qpropRegular &\n" +
    "\tnode Regular.js true pi58 2 qpropRegular &\n" +
    "\tnode Regular.js true pi59 2 qpropRegular \n" +
    "\t sleep 5\n" +
    "done\n");
regularSIDUP.write("for i in {1..10}\n" +
    "do\n" +
    "\tnode Regular.js false admitter 2 sidupRegular &\n" +
    "\tnode Regular.js false monitor 2 sidupRegular &\n" +
    "\tnode Regular.js false pi2 2 sidupRegular &\n" +
    "\tnode Regular.js false pi3 2 sidupRegular &\n" +
    "\tnode Regular.js false pi4 2 sidupRegular &\n" +
    "\tnode Regular.js false pi5 2 sidupRegular &\n" +
    "\tnode Regular.js false pi6 2 sidupRegular &\n" +
    "\tnode Regular.js false pi7 2 sidupRegular &\n" +
    "\tnode Regular.js false pi8 2 sidupRegular &\n" +
    "\tnode Regular.js false pi9 2 sidupRegular &\n" +
    "\tnode Regular.js false pi10 2 sidupRegular &\n" +
    "\tnode Regular.js false pi11 2 sidupRegular &\n" +
    "\tnode Regular.js false pi12 2 sidupRegular &\n" +
    "\tnode Regular.js false pi13 2 sidupRegular &\n" +
    "\tnode Regular.js false pi14 2 sidupRegular &\n" +
    "\tnode Regular.js false pi15 2 sidupRegular &\n" +
    "\tnode Regular.js false pi16 2 sidupRegular &\n" +
    "\tnode Regular.js false pi17 2 sidupRegular &\n" +
    "\tnode Regular.js false pi18 2 sidupRegular &\n" +
    "\tnode Regular.js false pi19 2 sidupRegular &\n" +
    "\tnode Regular.js false pi20 2 sidupRegular &\n" +
    "\tnode Regular.js false pi21 2 sidupRegular &\n" +
    "\tnode Regular.js false pi22 2 sidupRegular &\n" +
    "\tnode Regular.js false pi23 2 sidupRegular &\n" +
    "\tnode Regular.js false pi24 2 sidupRegular &\n" +
    "\tnode Regular.js false pi25 2 sidupRegular &\n" +
    "\tnode Regular.js false pi26 2 sidupRegular &\n" +
    "\tnode Regular.js false pi27 2 sidupRegular &\n" +
    "\tnode Regular.js false pi28 2 sidupRegular &\n" +
    "\tnode Regular.js false pi29 2 sidupRegular &\n" +
    "\tnode Regular.js false pi30 2 sidupRegular &\n" +
    "\tnode Regular.js false pi31 2 sidupRegular &\n" +
    "\tnode Regular.js false pi32 2 sidupRegular &\n" +
    "\tnode Regular.js false pi33 2 sidupRegular &\n" +
    "\tnode Regular.js false pi34 2 sidupRegular &\n" +
    "\tnode Regular.js false pi35 2 sidupRegular &\n" +
    "\tnode Regular.js false pi36 2 sidupRegular &\n" +
    "\tnode Regular.js false pi37 2 sidupRegular &\n" +
    "\tnode Regular.js false pi38 2 sidupRegular &\n" +
    "\tnode Regular.js false pi39 2 sidupRegular &\n" +
    "\tnode Regular.js false pi40 2 sidupRegular &\n" +
    "\tnode Regular.js false pi41 2 sidupRegular &\n" +
    "\tnode Regular.js false pi42 2 sidupRegular &\n" +
    "\tnode Regular.js false pi43 2 sidupRegular &\n" +
    "\tnode Regular.js false pi44 2 sidupRegular &\n" +
    "\tnode Regular.js false pi45 2 sidupRegular &\n" +
    "\tnode Regular.js false pi46 2 sidupRegular &\n" +
    "\tnode Regular.js false pi47 2 sidupRegular &\n" +
    "\tnode Regular.js false pi48 2 sidupRegular &\n" +
    "\tnode Regular.js false pi49 2 sidupRegular &\n" +
    "\tnode Regular.js false pi50 2 sidupRegular &\n" +
    "\tnode Regular.js false pi51 2 sidupRegular &\n" +
    "\tnode Regular.js false pi52 2 sidupRegular &\n" +
    "\tnode Regular.js false pi53 2 sidupRegular &\n" +
    "\tnode Regular.js false pi54 2 sidupRegular &\n" +
    "\tnode Regular.js false pi55 2 sidupRegular &\n" +
    "\tnode Regular.js false pi56 2 sidupRegular &\n" +
    "\tnode Regular.js false pi57 2 sidupRegular &\n" +
    "\tnode Regular.js false pi58 2 sidupRegular &\n" +
    "\tnode Regular.js false pi59 2 sidupRegular \n" +
    "\t sleep 5\n" +
    "done\n");
regularQPROP.end();
regularSIDUP.end();
/*for(var i=2;i<60;i++){
    console.log("\"\\tnode Fan.js true pi"+i+" 2 qpropFan &\\n\" +")
}*/
/*for(var i=2;i<60;i++){
    console.log("\"\\tnode Fan.js false pi"+i+" 2 sidupFan &\\n\" +")
}*/ 
//# sourceMappingURL=GenerateBashScripts.js.map