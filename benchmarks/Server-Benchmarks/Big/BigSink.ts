import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var totalNeighbours = 0
var neighbours : Array<ClientBufferSocket> = []
var exited = 0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)

function mHandler(data){
    function neighbour(totalAmount,neighbourPort){
        totalNeighbours = totalAmount
        var neighbourSocket = new ClientBufferSocket(neighbourPort,mHandler)
        neighbours.push(neighbourSocket)
        if(neighbours.length == totalAmount){
            socketToMain.emit(["actorInit"])
        }
    }

    function exit(){
        exited += 1
        if(exited == totalNeighbours){
            socketToMain.emit(["end"])
        }
    }
    switch(data[0]){
        case "neighbour":
            neighbour(data[1],data[2])
            break;
        case "exit":
            exit()
            break;
        default :
            console.log("Unknown message in sink: " + data[0])
    }
}