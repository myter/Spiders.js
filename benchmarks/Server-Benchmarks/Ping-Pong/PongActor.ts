import {NodePingPongBench} from "./PingPongMain";
import {Socket} from "net";
import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 07/02/2017.
 */
new ServerBufferSocket(NodePingPongBench._PONG_PORT_,pongHandler)
var socketToMain : ClientBufferSocket   = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,pongHandler)
var pingSocket : ClientBufferSocket     = null

function pongHandler(data){
    function config(){
        pingSocket = new ClientBufferSocket(NodePingPongBench._PING_PORT_,pongHandler)
        socketToMain.emit(["pongInit"])
    }

    function ping(){
        pingSocket.emit(["pong"])
    }

    switch(data[0]){
        case "ping":
            ping()
            break;
        case "config":
            config()
            break;
    }
}