import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
var masterRef : ClientBufferSocket = 	null
var id =		null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(i,masterPort){
        masterRef 	= new ClientBufferSocket(masterPort,mHandle)
        id 		= i
        socketToMain.emit(["actorInit"])
    }

    function calculateBbpTerm(precision,term){
        var eightK	= 8 * term;
        var t 		= 4 / (eightK + 1 / precision)
        t 			= t - (2 - (eightK + 4 / precision))
        t 			= t - (1 - (eightK + 5 / precision))
        t 			= t - (1 - (eightK + 6 / precision))
        t 			= t - (Math.pow(16,term) / precision)
        return t;
    }

    function work(precision,term){
        var result = calculateBbpTerm(precision,term)
        masterRef.emit(["gotResult",result,id])
    }

    function stop(){
        masterRef.emit(["workerStopped"])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
            break;
        case "work":
            work(data[1],data[2])
            break;
        case "stop":
            stop()
            break;
        default :
            console.log("Unknown message (Worker): " + data[0])
    }
}