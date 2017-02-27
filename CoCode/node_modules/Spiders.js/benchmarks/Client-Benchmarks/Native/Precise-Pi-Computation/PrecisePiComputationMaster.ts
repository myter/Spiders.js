/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var numWorkers = 			null
    var precision =				null
    var workers = 				{}
    var tolerance =				null
    var numWorkersTerminated = 	0
    var numTermsRequested =		0
    var numTermsReceived = 		0
    var stopRequests =		false

    function mHandle(event){
        function config(nw,prec){
            numWorkers = nw
            precision 	= prec
            tolerance 	= moveDecimal(1,precision)
        }

        function newWorker(ref,id){
            ref.onmessage = mHandle
            workers[id] = ref
        }

        function configDone(){
            self.postMessage(["actorInit"])
        }

        function moveDecimal(dec,n){
            return dec / Math.pow(10,n)
        }

        function generateWork(id){
            workers[id].postMessage(["work",precision,numTermsRequested])
            numTermsRequested += 1
        }

        function start(){
            var t = 0
            while(t < Math.min(precision,10 * numWorkers)){
                generateWork(t % numWorkers)
                t += 1
            }
        }

        function requestWorkersToExit(){
            for(var i in workers){
                workers[i].postMessage(["stop"])
            }
        }

        function gotResult(result,id){
            numTermsReceived += 1
            result 		  += result
            if(result < tolerance){
                stopRequests = true
            }
            if(!stopRequests){
                generateWork(id)
            }
            if (numTermsReceived == numTermsRequested) {
                requestWorkersToExit()
            }
        }

        function workerStopped(){
            numWorkersTerminated += 1
            if(numWorkersTerminated == numWorkers){
                self.postMessage(["end"])
            }
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2])
                break;
            case "newWorker":
                newWorker(event.ports[0],event.data[1])
                break;
            case "configDone":
                configDone()
                break;
            case "generateWork":
                generateWork(event.data[1])
                break;
            case "start":
                start()
                break;
            case "requestWorkersToExit":
                requestWorkersToExit()
                break;
            case "gotResult":
                gotResult(event.data[1],event.data[2])
                break;
            case "workerStopped":
                workerStopped()
                break;
            default :
                console.log("Unknown message (Master): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}