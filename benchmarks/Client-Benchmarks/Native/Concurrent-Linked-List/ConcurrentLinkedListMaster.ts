/**
 * Created by flo on 25/01/2017.
 */
module.exports = function(self){
    var totalWorkers = 	0
    var workersDone = 	0
    function mHandler(event){
        function config(tw){
            totalWorkers = tw
            self.postMessage(["actorInit"])
        }

        function workerDone(){
            workersDone += 1
            if(workersDone == totalWorkers){
                self.postMessage(["end"])
            }
        }

        function link(ref){
            ref.onmessage = mHandler
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1])
                break;
            case "workerDone":
                workerDone()
                break;
            case "link":
                link(event.ports[0])
                break;
            default :
                console.log("Unknown message: " + event.data[0])
        }
    }
    self.addEventListener('message',mHandler)
}