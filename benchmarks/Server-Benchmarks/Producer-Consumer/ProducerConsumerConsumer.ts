import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var managerRef : ClientBufferSocket  = null
var conCost     = 	0
var conItem     =	0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)

function mHandler(data){

    function config(cc,managerPort){
        conCost = cc
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

    function consume(item){
        conItem = processItem(conItem + item, conCost)
        managerRef.emit(["consumerAvailable",myPort])
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandler)
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
            break;
        case "consume":
            consume(data[1])
            break;
        case "link":
            link(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}