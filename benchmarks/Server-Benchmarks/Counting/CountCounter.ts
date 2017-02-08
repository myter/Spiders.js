import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
import {NodeCountBench} from "./CountMain";
/**
 * Created by flo on 07/02/2017.
 */
var totalCount =  null
var countSoFar =  null
new ServerBufferSocket(NodeCountBench._COUNT_WORKER_PORT,countHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,countHandler)

function countHandler(data){
    function config(countNumber){
        totalCount = countNumber
        countSoFar = 0
        new ClientBufferSocket(NodeCountBench._PROD_WORKER_PORT_,countHandler)
        socketToMain.emit(["countInit"])
    }

    function inc(fresh){
        if(fresh){
            countSoFar = 0
        }
        else{
            countSoFar += 1
            if(countSoFar == totalCount){
                socketToMain.emit(["countsExhausted"])
            }
        }
    }

    switch(data[0]){
        case "config":
            config(data[1])
            break;
        case "inc":
            inc(data[1])
            break;
    }
}