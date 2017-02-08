import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var totalWorkers = 	0
var workersDone = 	0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)
function mHandler(data){
    function config(tw){
        totalWorkers = tw
        socketToMain.emit(["actorInit"])
    }

    function workerDone(){
        workersDone += 1
        if(workersDone == totalWorkers){
            socketToMain.emit(["end"])
        }
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandler)
    }

    switch(data[0]){
        case "config":
            config(data[1])
            break;
        case "workerDone":
            workerDone()
            break;
        case "link":
            link(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}