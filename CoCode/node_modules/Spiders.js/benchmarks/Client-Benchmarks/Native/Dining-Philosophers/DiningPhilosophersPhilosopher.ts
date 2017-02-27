/**
 * Created by flo on 25/01/2017.
 */
module.exports = function(self){
    var waiterRef   = null
    var id          = null
    var totalRounds = null
    var doneRounds  = 0

    function mHandle(event){

        function config(i,tr,waiter){
            id 		= i
            totalRounds = tr
            waiterRef = waiter
            waiterRef.onmmesage = mHandle
            self.postMessage(["actorInit"])
        }

        function start(){
            var chan = new MessageChannel()
            chan.port2.onmessage = mHandle
            waiterRef.postMessage(["hungry",id],[chan.port1])
        }

        function denied(){
            var chan = new MessageChannel()
            chan.port2.onmessage = mHandle
            waiterRef.postMessage(["hungry",id],[chan.port1])
        }

        function eating(){
            doneRounds += 1
            waiterRef.postMessage(["done",id])
            if(doneRounds == totalRounds){
                waiterRef.postMessage(["philExit"])
            }
            else{
                var chan = new MessageChannel()
                chan.port2.onmessage = mHandle
                waiterRef.postMessage(["hungry",id],[chan.port1])
            }
        }
        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.ports[0])
                break;
            case "start":
                start()
                break;
            case "denied":
                denied()
                break;
            case "eating":
                eating()
                break;
            default :
                console.log("Unknown message: " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}