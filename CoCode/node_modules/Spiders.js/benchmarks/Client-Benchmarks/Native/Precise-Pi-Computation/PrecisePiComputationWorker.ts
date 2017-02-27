/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var masterRef = 	null
    var id =		null

    function mHandle(event){
        function config(master,i){
            masterRef 	= master
            masterRef.onmessage = mHandle
            id 		= i
            self.postMessage(["actorInit"])
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
            masterRef.postMessage(["gotResult",result,id])
        }

        function stop(){
            masterRef.postMessage(["workerStopped"])
        }

        switch(event.data[0]){
            case "config":
                config(event.ports[0],event.data[1])
                break;
            case "work":
                work(event.data[1],event.data[2])
                break;
            case "stop":
                stop()
                break;
            default :
                console.log("Unknown message (Worker): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}