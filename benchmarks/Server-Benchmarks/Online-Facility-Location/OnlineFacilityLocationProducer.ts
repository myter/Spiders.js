import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var quadRef : ClientBufferSocket = 		null
var gridSize = 		null
var numPoints = 	null
var itemsProduced = 	0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){

    function makePoint(xVal,yVal){
        return {
            x: xVal,
            y: yVal,
            getDistance: function(p){
                var xDiff = p.x - this.x
                var yDiff = p.y - this.y
                var distance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))
                return distance
            }
        }
    }

    function getRand(upper,lower){
        return Math.floor(Math.random() * (upper - lower) + lower)
    }

    function config(gs,nums,quadPort){
        quadRef 	= new ClientBufferSocket(quadPort,mHandle)
        gridSize 	= gs
        numPoints 	= nums
        socketToMain.emit(["actorInit"])
    }

    function produceConsumer(){
        var xVal 	= getRand(gridSize,0)
        var yVal 	= getRand(gridSize,0)
        var point 	= makePoint(xVal,yVal)
        quadRef.emit(["customerMsg",JSON.stringify(point),myPort])
        itemsProduced += 1
    }

    function nextCustomerMsg(){
        if(itemsProduced < numPoints){
            produceConsumer()
        }
        else{
            quadRef.emit(["requestExit"])
            socketToMain.emit(["actorExit"])
        }
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3])
            break;
        case "produceConsumer":
            produceConsumer()
            break;
        case "nextCustomerMsg":
            nextCustomerMsg()
            break;
        default :
            console.log("Unknown message (Producer): " + data[0])
    }
}