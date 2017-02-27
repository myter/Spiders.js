/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var sourceId = 	null
    var nextRef = 	null

    function mHandle(event){
        function config(si,next){
            sourceId 	= si
            nextRef 	= next
            nextRef.onmessage = mHandle
            self.postMessage(["actorInit"])
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        function valueMessage(val){
            nextRef.postMessage(["sourceValueMessage",sourceId,val])
        }

        function exit(){
            nextRef.postMessage(["exit"])
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.ports[0])
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
                console.log("Unknown message (Tagged Forward): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}