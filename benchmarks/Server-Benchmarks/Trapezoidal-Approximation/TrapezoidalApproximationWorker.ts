import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
var masterRef : ClientBufferSocket = null
var id = 		null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(i,masterPort){
        masterRef 	= new ClientBufferSocket(masterPort,mHandle)
        id 		= i
        socketToMain.emit(["actorInit"])
    }

    function fx(x){
        var a = Math.sin(Math.pow(x,3) - 1)
        var b = x + 1
        var c = a / b
        var d = Math.sqrt(1 + Math.exp(Math.sqrt(2 * x)))
        var r = c * d
        return r
    }

    function work(wl,wr,precision){
        var n 			= ((wr - wl) / precision)
        var accumArea 	= 0.0
        var i  			= 0
        while(i < n){
            var lx 		= (i * precision) + wl
            var rx 		= lx + precision
            var ly 		= fx(lx)
            var ry 		= fx(rx)
            var area 	= 0.5 * (ly + ry) * precision
            accumArea  += area
            i 		   += 1
        }
        masterRef.emit(["result",accumArea,id])
        socketToMain.emit(["actorExit"])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
            break;
        case "work":
            work(data[1],data[2],data[3])
            break;
        default :
            console.log("Unknown message (Worker): " + data[0])
    }
}