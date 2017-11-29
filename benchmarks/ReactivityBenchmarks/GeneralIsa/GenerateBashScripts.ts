var fs = require("fs")
var fanQPROP = fs.createWriteStream('RunFanQPROPBench.sh')
var fanSIDUP = fs.createWriteStream('RunFanSIDUPBench.sh')
var chainQPROP = fs.createWriteStream('RunChainQPROPBench.sh')
var chainSIDUP = fs.createWriteStream('RunChainSIDUPBench.sh')
var regularQPROP = fs.createWriteStream('RunRegularQPROPBench.sh')
var regularSIDUP = fs.createWriteStream('RunRegularSIDUPBench.sh')
for(var i =0;i <= 300;i+=50){
    if(i == 0) {
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
            "done\n")
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
            "done\n")

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
            "done\n")
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
            "done\n")


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
            "done\n")
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
            "done\n")
    }
    else{
        fanQPROP.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode Fan.js true monitor "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi2 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi3 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi4 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi5 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi6 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi7 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi8 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi9 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi10 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi11 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi12 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi13 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi14 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi15 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi16 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi17 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi18 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi19 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi20 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi21 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi22 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi23 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi24 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi25 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi26 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi27 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi28 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi29 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi30 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi31 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi32 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi33 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi34 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi35 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi36 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi37 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi38 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi39 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi40 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi41 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi42 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi43 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi44 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi45 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi46 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi47 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi48 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi49 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi50 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi51 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi52 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi53 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi54 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi55 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi56 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi57 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi58 "+i+" qpropFan &\n" +
            "\tnode Fan.js true pi59 "+i+" qpropFan \n" +
            "\t sleep 5\n" +
            "done\n")
        fanSIDUP.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode Fan.js false admitter "+i+" sidupFan &\n" +
            "\tnode Fan.js false monitor "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi2 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi3 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi4 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi5 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi6 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi7 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi8 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi9 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi10 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi11 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi12 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi13 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi14 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi15 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi16 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi17 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi18 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi19 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi20 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi21 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi22 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi23 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi24 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi25 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi26 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi27 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi28 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi29 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi30 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi31 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi32 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi33 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi34 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi35 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi36 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi37 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi38 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi39 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi40 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi41 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi42 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi43 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi44 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi45 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi46 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi47 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi48 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi49 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi50 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi51 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi52 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi53 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi54 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi55 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi56 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi57 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi58 "+i+" sidupFan &\n" +
            "\tnode Fan.js false pi59 "+i+" sidupFan \n" +
            "\t sleep 5\n" +
            "done\n")

        chainQPROP.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode Chain.js true monitor "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi2 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi3 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi4 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi5 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi6 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi7 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi8 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi9 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi10 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi11 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi12 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi13 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi14 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi15 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi16 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi17 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi18 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi19 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi20 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi21 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi22 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi23 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi24 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi25 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi26 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi27 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi28 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi29 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi30 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi31 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi32 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi33 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi34 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi35 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi36 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi37 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi38 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi39 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi40 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi41 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi42 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi43 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi44 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi45 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi46 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi47 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi48 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi49 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi50 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi51 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi52 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi53 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi54 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi55 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi56 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi57 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi58 "+i+" qpropChain &\n" +
            "\tnode Chain.js true pi59 "+i+" qpropChain \n" +
            "\t sleep 5\n" +
            "done\n")
        chainSIDUP.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode Chain.js false admitter "+i+" sidupChain &\n" +
            "\tnode Chain.js false monitor "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi2 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi3 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi4 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi5 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi6 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi7 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi8 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi9 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi10 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi11 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi12 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi13 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi14 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi15 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi16 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi17 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi18 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi19 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi20 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi21 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi22 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi23 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi24 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi25 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi26 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi27 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi28 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi29 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi30 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi31 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi32 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi33 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi34 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi35 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi36 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi37 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi38 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi39 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi40 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi41 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi42 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi43 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi44 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi45 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi46 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi47 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi48 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi49 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi50 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi51 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi52 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi53 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi54 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi55 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi56 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi57 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi58 "+i+" sidupChain &\n" +
            "\tnode Chain.js false pi59 "+i+" sidupChain \n" +
            "\t sleep 5\n" +
            "done\n")


        regularQPROP.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode Regular.js true monitor "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi2 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi3 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi4 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi5 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi6 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi7 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi8 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi9 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi10 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi11 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi12 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi13 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi14 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi15 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi16 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi17 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi18 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi19 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi20 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi21 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi22 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi23 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi24 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi25 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi26 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi27 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi28 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi29 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi30 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi31 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi32 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi33 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi34 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi35 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi36 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi37 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi38 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi39 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi40 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi41 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi42 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi43 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi44 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi45 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi46 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi47 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi48 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi49 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi50 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi51 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi52 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi53 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi54 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi55 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi56 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi57 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi58 "+i+" qpropRegular &\n" +
            "\tnode Regular.js true pi59 "+i+" qpropRegular \n" +
            "\t sleep 5\n" +
            "done\n")
        regularSIDUP.write("for i in {1..10}\n" +
            "do\n" +
            "\tnode Regular.js false admitter "+i+" sidupRegular &\n" +
            "\tnode Regular.js false monitor "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi2 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi3 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi4 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi5 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi6 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi7 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi8 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi9 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi10 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi11 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi12 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi13 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi14 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi15 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi16 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi17 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi18 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi19 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi20 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi21 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi22 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi23 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi24 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi25 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi26 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi27 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi28 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi29 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi30 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi31 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi32 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi33 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi34 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi35 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi36 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi37 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi38 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi39 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi40 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi41 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi42 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi43 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi44 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi45 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi46 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi47 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi48 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi49 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi50 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi51 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi52 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi53 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi54 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi55 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi56 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi57 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi58 "+i+" sidupRegular &\n" +
            "\tnode Regular.js false pi59 "+i+" sidupRegular \n" +
            "\t sleep 5\n" +
            "done\n")
    }
}
fanQPROP.end()
fanSIDUP.end()
chainQPROP.end()
chainSIDUP.end()
regularQPROP.end()
regularSIDUP.end()

/*for(var i=2;i<60;i++){
    console.log("\"\\tnode Fan.js true pi"+i+" 2 qpropFan &\\n\" +")
}*/

/*for(var i=2;i<60;i++){
    console.log("\"\\tnode Fan.js false pi"+i+" 2 sidupFan &\\n\" +")
}*/