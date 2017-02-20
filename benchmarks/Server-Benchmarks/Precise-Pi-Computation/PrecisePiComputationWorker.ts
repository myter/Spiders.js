import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
var masterRef : ClientBufferSocket = 	null
var id =		null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)
var Decimal = require('decimal.js')

function mHandle(data){
    function config(i,masterPort){
        masterRef 	= new ClientBufferSocket(masterPort,mHandle)
        id 		= i
        socketToMain.emit(["actorInit"])
    }

    function pi(precision) {
        // the Bailey-Borwein-Plouffe formula
        // http://stackoverflow.com/questions/4484489/using-basic-arithmetics-for-calculating-pi-with-arbitary-precision
        var p16 = new Decimal(1);
        var pi = new Decimal(0);
        var one = new Decimal(1);
        var two = new Decimal(2);
        var four = new Decimal(4);
        var k8 = new Decimal(0);

        for (var k = new Decimal(0); k.lte(precision); k = k.plus(one)) {
            // pi += 1/p16 * (4/(8*k + 1) - 2/(8*k + 4) - 1/(8*k + 5) - 1/(8*k+6));
            // p16 *= 16;
            //
            // a little simpler:
            // pi += p16 * (4/(8*k + 1) - 2/(8*k + 4) - 1/(8*k + 5) - 1/(8*k+6));
            // p16 /= 16;

            var f = four.div(k8.plus(1))
                .minus(two.div(k8.plus(4)))
                .minus(one.div(k8.plus(5)))
                .minus(one.div(k8.plus(6)));

            pi = pi.plus(p16.times(f));
            p16 = p16.div(16);
            k8 = k8.plus(8);
        }

        return pi;
    }

    function calculateBbpTerm(precision,term){
        //At this point getting the actual term does not matter
        //Naive implementation of benchmark which simply calculated pi for the given precies for each term
        var piNum = pi(precision)
    }

    function work(precision,term){
        var result = calculateBbpTerm(precision,term)
        masterRef.emit(["gotResult",result,id])
    }

    function stop(){
        masterRef.emit(["workerStopped"])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
            break;
        case "work":
            work(data[1],data[2])
            break;
        case "stop":
            stop()
            break;
        default :
            console.log("Unknown message (Worker): " + data[0])
    }
}