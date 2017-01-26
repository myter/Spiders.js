/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var limit = 		null
    var filterRef = 	null
    function mHandle(event){
        function config(l,filter){
            limit 		= l
            filterRef 	= filter
            filterRef.onmessage = mHandle
            self.postMessage(["actorInit"])
        }

        function start(){
            var candidate = 3
            while(candidate < limit){
                filterRef.postMessage(["longBox",candidate])
                candidate += 2
            }
            filterRef.postMessage(["stop"])
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.ports[0])
                break;
            case "start":
                start()
                break;
            case "link":
                link(event.ports[0])
                break;
            default :
                console.log("Unknown message (Number Producer): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}