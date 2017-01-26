/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var dataSize = 	0
    var radix = 		0
    var nextRef = 	null
    var valueSoFar = 0
    var j = 			0
    var ordering = 	[]

    function mHandle(event){
        function config(ds,r,next){
            dataSize 	= ds
            radix 		= r
            nextRef 	= next
            nextRef.onmessage = mHandle
            self.postMessage(["actorInit"])
        }

        function value(candidate){
            valueSoFar += 1
            var current = candidate
            if((current & radix) == 0){
                nextRef.postMessage(["value",candidate])
            }
            else{
                ordering[j] 	= candidate
                j 					+= 1
            }
            if(valueSoFar == dataSize){
                var i = 0
                while(i < j){
                    nextRef.postMessage(["value",ordering[i]])
                    i++
                }
                self.postMessage(["actorExit"])
            }
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.ports[0])
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