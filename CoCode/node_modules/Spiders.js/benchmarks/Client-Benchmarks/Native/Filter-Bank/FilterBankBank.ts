/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var id = 			null
    var totalColumns = 	null
    var integrateRef =	null
    var firstRef =		null

    function mHandle(event){
        function config(i,tc,integrate){
            id 			= i
            totalColumns 	= tc
            integrateRef 	= integrate
            integrateRef.onmessage = mHandle
            self.postMessage(["actorInit"])
        }

        function linkFirst(first){
            firstRef = first
            firstRef.onmessage = mHandle
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        function valueMessage(val){
            firstRef.postMessage(["valueMessage",val])
        }

        function exit(){
            firstRef.postMessage(["exit"])
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.ports[0])
                break;
            case "linkFirst":
                linkFirst(event.ports[0])
                break;
            case "link":
                link(event.ports[0])
                break;
            case "valueMessage":
                valueMessage(event.data[1])
                break;
            case "exit":
                exit()
                break;
            default :
                console.log("Unknown message (Bank): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}