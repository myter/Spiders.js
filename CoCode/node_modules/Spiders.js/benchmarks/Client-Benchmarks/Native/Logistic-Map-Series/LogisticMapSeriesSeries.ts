/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var masterRef =			null
    var rateComputerRef = 	null
    var startTerm = 			0
    var curTerm = 			0

    function mHandle(event){
        function config(st){
            startTerm 			= st
            curTerm 			= st
            self.postMessage(["actorInit"])
        }

        function linkMaster(master){
            masterRef = master
            masterRef.onmessage = mHandle
        }

        function linkRate(rateComputer){
            rateComputerRef = rateComputer
            rateComputerRef.onmessage = mHandle
        }

        function nextTerm(){
            var chan = new MessageChannel()
            chan.port2.onmessage = mHandle
            rateComputerRef.postMessage(["compute",curTerm],[chan.port1])
        }

        function termDone(res){
            curTerm = res
            masterRef.postMessage(["result",res])
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1])
                break;
            case "linkMaster":
                linkMaster(event.ports[0])
                break;
            case "linkRate":
                linkRate(event.ports[0])
                break;
            case "nextTerm":
                nextTerm()
                break;
            case "termDone":
                termDone(event.data[1])
                break;
            default :
                console.log("Unknown message: " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}