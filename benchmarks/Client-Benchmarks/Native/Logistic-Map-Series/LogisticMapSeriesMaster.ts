/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var totalTerms =	0
    var workRequested =	0
    var workReceived =	0
    var workers =		[]
    var termsSum = 		0

    function mHandle(event){

        function newWorker(workerRef,tw,tt){
            totalTerms = tt
            workers.push(workerRef)
            workerRef.onmessage = mHandle
            if(workers.length == tw){
                self.postMessage(["actorInit"])
            }
        }

        function start(){
            var i = 0
            while(i < totalTerms){
                for(var j in workers){
                    workers[j].postMessage(["nextTerm"])
                    workRequested += 1
                }
                i++
            }
        }

        function result(term){
            termsSum 		+= term
            workReceived 	+= 1
            if(workRequested == workReceived){
                self.postMessage(["end"])
            }
        }

        switch(event.data[0]){
            case "newWorker":
                newWorker(event.ports[0],event.data[1],event.data[2])
                break;
            case "start":
                start()
                break;
            case "result":
                result(event.data[1])
                break;
            default :
                console.log("Unknown message: " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}