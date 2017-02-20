import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
var numWorkers = 			null
var precision =				null
var workers : Array<ClientBufferSocket> = 				[]
var tolerance =				null
var numWorkersTerminated = 	0
var numTermsRequested =		0
var numTermsReceived = 		0
var stopRequests =		false
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(nw,prec){
        numWorkers = nw
        precision 	= prec
        tolerance 	= moveDecimal(1,precision)
    }

    function newWorker(id,refPort){
        var ref = new ClientBufferSocket(refPort,mHandle)
        workers[id] = ref
    }

    function configDone(){
        socketToMain.emit(["actorInit"])
    }

    function moveDecimal(dec,n){
        return dec / Math.pow(10,n)
    }

    function generateWork(id){
        workers[id].emit(["work",precision,numTermsRequested])
        numTermsRequested += 1
    }

    function start(){
        var t = 0
        while(t < precision){
            generateWork(t % numWorkers)
            t += 1
        }
    }

    function requestWorkersToExit(){
        for(var i in workers){
            workers[i].emit(["stop"])
        }
    }

    function gotResult(result,id){
        numTermsReceived += 1
        if (numTermsReceived == numTermsRequested) {
            requestWorkersToExit()
        }
    }

    function workerStopped(){
        numWorkersTerminated += 1
        if(numWorkersTerminated == numWorkers){
            socketToMain.emit(["end"])
        }
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
            break;
        case "newWorker":
            newWorker(data[1],data[2])
            break;
        case "configDone":
            configDone()
            break;
        case "generateWork":
            generateWork(data[1])
            break;
        case "start":
            start()
            break;
        case "requestWorkersToExit":
            requestWorkersToExit()
            break;
        case "gotResult":
            gotResult(data[1],data[2])
            break;
        case "workerStopped":
            workerStopped()
            break;
        default :
            console.log("Unknown message (Master): " + data[0])
    }
}