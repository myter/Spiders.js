/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var sampleRate = 		null
    var nextRef = 			null
    var samplesReceived = 	0

    function mHandle(event){
        function config(sr,next){
            sampleRate = sr
            nextRef 	= next
            nextRef.onmessage = mHandle
            self.postMessage(["actorInit"])
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        function valueMessage(val){
            if(samplesReceived == 0){
                nextRef.postMessage(["valueMessage",val])
            }
            else{
                nextRef.postMessage(["valueMessage",0])
            }
            samplesReceived =  (samplesReceived + 1) % sampleRate
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
                console.log("Unknown message (Sample): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}