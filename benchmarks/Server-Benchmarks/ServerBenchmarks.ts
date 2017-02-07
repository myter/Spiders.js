import {SpiderBenchmarkRunner} from "../benchUtils";
import {NodePingPongBench} from "./Ping-Pong/PingPongMain";
/**
 * Created by flo on 07/02/2017.
 */
var runner = new SpiderBenchmarkRunner()
runner.schedule(NodePingPongBench)
console.log("Starting server benchmarks")
runner.nextBenchmark()