import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var arbiterRef : ClientBufferSocket = null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)
var linked = 0
function mHandle(data){

    function config(arbiterPort){
        arbiterRef = new ClientBufferSocket(arbiterPort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function busyWait(limit){
        for(var i = 0;i < limit;i++){
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }

    function startSmoking(time){
        arbiterRef.emit(["startedSmoking"])
        busyWait(time)
    }

    switch(data[0]){
        case "config":
            config(data[1])
            break;
        case "startSmoking":
            startSmoking(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }

}