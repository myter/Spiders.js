import {Socket} from "net";
import {NodePingPongBench} from "./PingPongMain";
import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 07/02/2017.
 */
new ServerBufferSocket(NodePingPongBench._PING_PORT_,pingHandler)
var totalPings                              = null
var pingsLeft                               = null
var pongSocket  : ClientBufferSocket        = null
var socketToMain : ClientBufferSocket       = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,pingHandler)

function pingHandler(data){
    function config(amPings){
        totalPings          = amPings
        pingsLeft 	        = amPings
        pongSocket          = new ClientBufferSocket(NodePingPongBench._PONG_PORT_,pingHandler)
        socketToMain.emit(["pingInit"])
    }

    function start(){
        pingsLeft 	= totalPings
        pongSocket.emit(["ping"])
        pingsLeft -= 1
    }

    function pong(){
        if(pingsLeft == 0){
            socketToMain.emit(["pingsExhausted"])
        }
        else{
            pingsLeft -= 1
            pongSocket.emit(["ping"])
        }
    }

    switch(data[0]){
        case "config":
            config(data[1])
            break;
        case "start":
            start()
            break;
        case "pong" :
            pong()
            break;
        default:
            console.log("Ping did not understand : " + data[0])
    }
}