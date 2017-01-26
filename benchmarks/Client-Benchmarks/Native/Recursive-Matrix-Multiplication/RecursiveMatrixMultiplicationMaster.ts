/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var numWorkers = 			null
    var dataLength = 			null
    var workers = 				{}
    var numWorkersTerminated = 	0
    var numWorkSent =			0
    var numWorkCompleted = 		0

    function mHandle(event){
        function config(nw,dl){
            numWorkers = nw
            dataLength = dl
        }

        function newWorker(workerRef,id){
            workerRef.onmessage = mHandle
            workers[id] = workerRef
        }

        function configDone(){
            self.postMessage(["actorInit"])
        }

        function start(){
            var numBlocks 	= dataLength * dataLength
            sendWork(0, 0, 0, 0, 0, 0, 0, numBlocks, dataLength)
        }

        function sendWork(priority,srA,scA,srB,scB,srC,scC,numBlocks,dim){
            var workerIndex = (srC + scC) % numWorkers
            workers[workerIndex].postMessage(["work",priority,srA,scA,srB,scB,srC,scC,numBlocks,dim])
            numWorkSent += 1
        }

        function done(){
            numWorkCompleted += 1
            if(numWorkCompleted == numWorkSent){
                for(var i in workers){
                    workers[i].postMessage(["stop"])
                }
            }
        }

        function stop(){
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
            case "start":
                start()
                break;
            case "sendWork":
                sendWork(event.data[1],event.data[2],event.data[3],event.data[4],event.data[5],event.data[6],event.data[7],event.data[8],event.data[9])
                break;
            case "done":
                done()
                break;
            case "stop":
                stop()
                break;
            default :
                console.log("Unknown message (Master): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}