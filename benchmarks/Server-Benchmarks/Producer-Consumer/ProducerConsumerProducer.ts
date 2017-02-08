import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var managerRef : ClientBufferSocket = 	null
var prodItem =		0.0
var totalItems = 	0
var currentItems = 	0
var prodCost = 		0
var stopped =		false
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)

function mHandler(data){

    function config(ti,pc,managerPort){
        totalItems = ti
        prodCost 	= pc
        managerRef = new ClientBufferSocket(managerPort,mHandler)
        socketToMain.emit(["actorInit"])
    }

    function getRandom(upper){
        return Math.floor(Math.random() * (upper - 0 + 1)) + 0;
    }

    function processItem(item,cost){
        var result 	= item
        var rand 	= getRandom(cost)
        if(cost > 0){
            for(var i = 0;i < cost;i++){
                for(var j = 0;j < 100;j++){
                    result += Math.log(Math.abs(getRandom(100)) + 0.01)
                }
            }
        }
        else{
            result += Math.log(Math.abs(getRandom(100)) + 0.01)
        }
        return result
    }

    function produce(){
        if(!(stopped)){
            if(currentItems == totalItems){
                managerRef.emit(["producerStopped"])
                stopped = true
            }
            else{
                prodItem = processItem(prodItem,prodCost)
                managerRef.emit(["newDataProduced",prodItem,myPort])
                currentItems += 1
            }
        }
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3])
            break;
        case "processItem":
            processItem(data[1],data[2])
            break;
        case "produce":
            produce()
            break;
        default :
            console.log("Unknown message: " + data[0])
    }

}