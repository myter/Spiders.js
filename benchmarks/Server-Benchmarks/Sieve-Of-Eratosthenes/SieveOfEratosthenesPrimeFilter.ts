import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var local 	=		null
var id =			null
var initPrime = 		null
var nextFilter : ClientBufferSocket = 	null
var localPrimes = 	[]
var available = 		1
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(i,ip,l){
        local 		= l
        id 		= i
        initPrime	= ip
        socketToMain.emit(["actorInit"])
        localPrimes[0] 	= initPrime
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
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
            socketToMain.emit(["spawnNew",id + 1,candidate,myPort])
        }
    }

    function newSpawned(refPort){
        nextFilter = new ClientBufferSocket(refPort,mHandle)
    }

    function longBox(candidate){
        var localPrime = isLocallyPrime(candidate,0,available)
        if(localPrime){
            if(nextFilter == null){
                handleNewPrime(candidate)
            }
            else{
                nextFilter.emit(["longBox",candidate])
            }
        }
    }

    function stop(){
        if(nextFilter == null){
            socketToMain.emit(["end"])
        }
        else{
            nextFilter.emit(["stop"])
        }
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3])
            break;
        case "link":
            link(data[1])
            break;
        case "newSpawned":
            newSpawned(data[1])
            break;
        case "longBox":
            longBox(data[1])
            break;
        case "stop":
            stop()
            break;
        default :
            console.log("Unknown message (Filter): " + data[0])
    }
}