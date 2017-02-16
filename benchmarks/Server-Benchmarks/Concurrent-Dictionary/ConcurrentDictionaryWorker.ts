import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var masterRef : ClientBufferSocket      = null
var dictRef : ClientBufferSocket        = null
var writePercentage = 0
var totalMsgs       = 0
var currentMsgs     = 0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)

function mHandler(data){

    function config(wp,t){
        writePercentage 	= wp
        totalMsgs			= t
        socketToMain.emit(["actorInit"])
    }

    function linkMaster(masterPort){
        masterRef = new ClientBufferSocket(masterPort,mHandler)
    }

    function linkDict(dictPort){
        dictRef = new ClientBufferSocket(dictPort,mHandler)
    }

    function getRandom(){
        return Math.floor(Math.random() * (100 - 0 + 1)) + 0;
    }

    function work(){
        currentMsgs += 1
        if(currentMsgs <= totalMsgs){
            var rand = getRandom()
            if(rand < writePercentage){
                var key = getRandom()
                var val = getRandom()
                dictRef.emit(["write",key,val,myPort])
            }
            else{
                var key = getRandom()
                dictRef.emit(["read",key,myPort])
            }
        }
        else{
            masterRef.emit(["workerDone"])
        }
    }

    switch(data[0]){
        case "config" :
            config(data[1],data[2])
            break;
        case "work":
            work()
            break;
        case "linkMaster":
            linkMaster(data[1])
            break;
        case "linkDict":
            linkDict(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}