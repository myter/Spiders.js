import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var masterRef : ClientBufferSocket =			null
var rateComputerRef : ClientBufferSocket = 	null
var startTerm = 			0
var curTerm = 			0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(st){
        startTerm 			= st
        curTerm 			= st
        socketToMain.emit(["actorInit"])
    }

    function linkMaster(masterPort){
        masterRef = new ClientBufferSocket(masterPort,mHandle)
    }

    function linkRate(rateComputerPort){
        rateComputerRef = new ClientBufferSocket(rateComputerPort,mHandle)
    }

    function nextTerm(){
        rateComputerRef.emit(["compute",curTerm,myPort])
    }

    function termDone(res){
        curTerm = res
        masterRef.emit(["result",res])
    }

    switch(data[0]){
        case "config":
            config(data[1])
            break;
        case "linkMaster":
            linkMaster(data[1])
            break;
        case "linkRate":
            linkRate(data[1])
            break;
        case "nextTerm":
            nextTerm()
            break;
        case "termDone":
            termDone(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}