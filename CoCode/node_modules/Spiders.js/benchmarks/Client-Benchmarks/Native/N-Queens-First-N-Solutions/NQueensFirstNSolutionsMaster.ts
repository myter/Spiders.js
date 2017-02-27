/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var solutions = 			null
    var priorities = 			null
    var numWorkers = 			null
    var workers = 				[]
    var messageCounter = 		0
    var numWorkersTerminated = 	0
    var numWorkSent =			0
    var numWorkCompleted =		0
    var resultCounter = 		0

    function mHandle(event){
        function config(s,p,n){
            solutions 	= s
            priorities = p
            numWorkers = n
        }

        function addWorker(workerRef,id){
            workers[id] = workerRef
            workerRef.onmessage = mHandle
        }

        function configDone(){
            self.postMessage(["actorInit"])
        }

        function start(){
            sendWork(priorities,[],0)
        }

        function sendWork(priority,data,depth){
            workers[messageCounter].postMessage(["work",priority,data,depth])
            messageCounter = (messageCounter + 1) % numWorkers
            numWorkSent   += 1
        }

        function result(){
            resultCounter += 1
            if(resultCounter >= solutions){
                self.postMessage(["end"])
            }
        }

        function done(){
            numWorkCompleted += 1
            if(numWorkCompleted == numWorkSent){
                self.postMessage(["end"])
            }
        }


        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.data[3])
                break;
            case "addWorker":
                addWorker(event.ports[0],event.data[1])
                break;
            case "configDone":
                configDone()
                break;
            case "start":
                start()
                break;
            case "sendWork":
                sendWork(event.data[1],event.data[2],event.data[3])
                break;
            case "result":
                result()
                break;
            case "done":
                done()
                break;
            default :
                console.log("Unknown message (Master): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}