/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var local 	=		null
    var id =			null
    var initPrime = 		null
    var nextFilter = 	null
    var localPrimes = 	[]
    var available = 		1
    function mHandle(event){
        function config(i,ip,l){
            local 		= l
            id 		= i
            initPrime	= ip
            self.postMessage(["actorInit"])
            localPrimes[0] 	= initPrime
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        function isLocallyPrime(candidate,startInc,endExc){
            for (var i = startInc; i < endExc; i++) {
                var remainder = candidate % localPrimes[i];
                if(remainder == 0){
                    return false;
                }
            }
            return true;
        }

        function handleNewPrime(candidate){
            if(available < local){
                localPrimes[available] = candidate
                available += 1
            }
            else{
                var c = new MessageChannel()
                c.port2.onmessage = mHandle
                self.postMessage(["spawnNew",id + 1,candidate],[c.port1])
            }
        }

        function newSpawned(ref){
            nextFilter = ref
            nextFilter.onmessage = mHandle
        }

        function longBox(candidate){
            var localPrime = isLocallyPrime(candidate,0,available)
            if(localPrime){
                if(nextFilter == null){
                    handleNewPrime(candidate)
                }
                else{
                    nextFilter.postMessage(["longBox",candidate])
                }
            }
        }

        function stop(){
            if(nextFilter == null){
                self.postMessage(["end"])
            }
            else{
                nextFilter.postMessage(["stop"])
            }
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.data[3])
                break;
            case "link":
                link(event.ports[0])
                break;
            case "newSpawned":
                newSpawned(event.ports[0])
                break;
            case "longBox":
                longBox(event.data[1])
                break;
            case "stop":
                stop()
                break;
            default :
                console.log("Unknown message (Filter): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}