import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
import {NodeBigBench} from "./BigMain";
/**
 * Created by flo on 08/02/2017.
 */
var sinkRef : ClientBufferSocket = null
var neighbours : Map<number,ClientBufferSocket> = new Map()
var totalNeighbours = 0
var pingsReceived = 0
var pingsExpected = 0
var myPort        = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain  = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)

function mHandler(data){

    function setSink(){
        sinkRef = new ClientBufferSocket(NodeBigBench._SINK_PORT_,mHandler)
    }

    function neighbour(totalAmount,totalPings,neighBourPort){
        var refSocket = new ClientBufferSocket(neighBourPort,mHandler)
        pingsExpected = totalPings
        neighbours.set(neighBourPort,refSocket)
        totalNeighbours++
        if(totalNeighbours ==  totalAmount -1){
            socketToMain.emit(["actorInit"])
        }
    }

    function ping(senderPort){
        var senderSocket = neighbours.get(senderPort)
        senderSocket.emit(["pong"])
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandler)
    }

    function pong(){
        if(pingsReceived == pingsExpected){
            sinkRef.emit(["exit"])
        }
        else{
            pingsReceived += 1
            var targetIndex = Math.floor((Math.random() * totalNeighbours));
            var index = 0
            neighbours.forEach((neighBour : ClientBufferSocket)=>{
                if(index == targetIndex){
                    neighBour.emit(["ping",myPort])
                }
                index++
            })
        }
    }
    switch(data[0]){
        case "setSink":
            setSink()
            break;
        case "neighbour":
            neighbour(data[1],data[2],data[3])
            break;
        case "ping":
            ping(data[1])
            break;
        case "pong":
            pong()
            break;
        case "link":
            link(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}