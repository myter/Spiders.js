import {SpiderBenchmarkRunner, BenchConfig} from "../benchUtils";
import {SequentialFilterBench} from "./SequentialFilter";
import {ChildProcessFilterBench} from "./ChildProcessFilterMain";
import {SpiderParallelFilterBench} from "./ParallelFilter";
/**
 * Created by flo on 17/02/2017.
 */
var runner = new SpiderBenchmarkRunner()
runner.schedule(SpiderParallelFilterBench,()=>{
    console.log("Setting workers to 12")
    BenchConfig.filterImageWorkers   = 12
})
runner.schedule(SpiderParallelFilterBench,()=>{
    console.log("Setting workers to 10")
    BenchConfig.filterImageWorkers   = 10
})
runner.schedule(SpiderParallelFilterBench,()=>{
    console.log("Setting workers to 8")
    BenchConfig.filterImageWorkers   = 8
})
runner.schedule(SpiderParallelFilterBench,()=>{
    console.log("Setting workers to 6")
    BenchConfig.filterImageWorkers   = 6
})
runner.schedule(SpiderParallelFilterBench,()=>{
    console.log("Setting workers to 4")
    BenchConfig.filterImageWorkers   = 4
})
runner.schedule(SpiderParallelFilterBench,()=>{
    console.log("Setting workers to 2")
    BenchConfig.filterImageWorkers   = 2
})



runner.schedule(ChildProcessFilterBench,()=>{
    console.log("Setting workers to 12")
    BenchConfig.filterImageWorkers   = 12
})
runner.schedule(ChildProcessFilterBench,()=>{
    console.log("Setting workers to 10")
    BenchConfig.filterImageWorkers   = 10
})
runner.schedule(ChildProcessFilterBench,()=>{
    console.log("Setting workers to 8")
    BenchConfig.filterImageWorkers   = 8
})
runner.schedule(ChildProcessFilterBench,()=>{
    console.log("Setting workers to 6")
    BenchConfig.filterImageWorkers   = 6
})
runner.schedule(ChildProcessFilterBench,()=>{
    console.log("Setting workers to 4")
    BenchConfig.filterImageWorkers   = 4
})
runner.schedule(ChildProcessFilterBench,()=>{
     console.log("Setting workers to 2")
     BenchConfig.filterImageWorkers   = 2
 })

runner.schedule(SequentialFilterBench)



console.log("Starting Server Speedup Benchmarks")
runner.nextBenchmark()