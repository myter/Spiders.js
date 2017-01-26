/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var dataSize = 		0
    var sumSoFar = 		0
    var valueSoFar = 	0
    var prevValue = 	0
    var errorValue1 = 	-1
    var errorValue2 =	-1

    function mHandle(event){
        function config(ds){
            dataSize = ds
            self.postMessage(["actorInit"])
        }

        function value(candidate){
            valueSoFar += 1
            if(candidate < prevValue && errorValue1 < 0){
                errorValue2 = candidate
                errorValue1 = valueSoFar - 1
            }
            prevValue = candidate
            sumSoFar += prevValue
            if(valueSoFar == dataSize){
                self.postMessage(["actorExit"])
            }
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1])
                break;
            case "value":
                value(event.data[1])
                break;
            case "link":
                link(event.ports[0])
                break;
            default :
                console.log("Unknown message: " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}