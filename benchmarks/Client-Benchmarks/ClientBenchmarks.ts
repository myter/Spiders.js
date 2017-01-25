import {SpiderBenchmarkRunner} from "../benchUtils";
import {NatPingPongBench} from "./Ping-Pong-Native/NatPingPongMain";
import {NatCountBench} from "./Counting-Native/NatCountMain";
/**
 * Created by flo on 24/01/2017.
 */
var runner = new SpiderBenchmarkRunner()
//runner.schedule(NatPingPongBench)
runner.schedule(NatCountBench)
console.log("Starting Benchmark")
runner.nextBenchmark()
