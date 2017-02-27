/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var producerRef = 	null
    var branchesRef = 	null
    var maxValue =		1000
    var current =  		0

    function mHandle(event){


        function linkProducer(producer){
            producerRef = producer
            producerRef.onmessage = mHandle
        }

        function linkBranches(branches){
            branchesRef = branches
            branchesRef.onmessage = mHandle
        }

        function configDone(){
            self.postMessage(["actorInit"])
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        function boot(){
            branchesRef.postMessage(["valueMessage",current])
            current = (current + 1) % maxValue
            producerRef.postMessage(["nextMessage"])
        }

        function exit(){
            branchesRef.postMessage(["exit"])
        }

        switch(event.data[0]){
            case "linkProducer":
                linkProducer(event.ports[0])
                break;
            case "linkBranches":
                linkBranches(event.ports[0])
                break;
            case "link":
                link(event.ports[0])
                break;
            case "configDone":
                configDone()
                break;
            case "boot":
                boot()
                break;
            case "exit":
                exit()
                break;
            default :
                console.log("Unknown message (Source): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}