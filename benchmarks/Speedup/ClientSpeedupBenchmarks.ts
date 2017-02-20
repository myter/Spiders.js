import {SpiderBenchmarkRunner, BenchConfig} from "../benchUtils";
import {SpiderParallelFilterBench} from "./ParallelFilter";
import {WWParallelFilterBench} from "./WWParallelFilterMain";
import {SequentialFilterBench} from "./SequentialFilter";
/**
 * Created by flo on 19/02/2017.
 */
var runner = new SpiderBenchmarkRunner()
// runner.schedule(SpiderParallelFilterBench,()=>{
//     console.log("Setting workers to 12")
//     BenchConfig.filterImageWorkers   = 12
// })
// runner.schedule(SpiderParallelFilterBench,()=>{
//     console.log("Setting workers to 10")
//     BenchConfig.filterImageWorkers   = 10
// })
// runner.schedule(SpiderParallelFilterBench,()=>{
//     console.log("Setting workers to 8")
//     BenchConfig.filterImageWorkers   = 8
// })
// runner.schedule(SpiderParallelFilterBench,()=>{
//     console.log("Setting workers to 6")
//     BenchConfig.filterImageWorkers   = 6
// })
// runner.schedule(SpiderParallelFilterBench,()=>{
//     console.log("Setting workers to 4")
//     BenchConfig.filterImageWorkers   = 4
// })
// runner.schedule(SpiderParallelFilterBench,()=>{
//     console.log("Setting workers to 2")
//     BenchConfig.filterImageWorkers   = 2
// })


runner.schedule(WWParallelFilterBench,()=>{
    console.log("Setting workers to 2")
    BenchConfig.filterImageWorkers   = 2
})
runner.schedule(WWParallelFilterBench,()=>{
    console.log("Setting workers to 4")
    BenchConfig.filterImageWorkers   = 4
})
runner.schedule(WWParallelFilterBench,()=>{
    console.log("Setting workers to 6")
    BenchConfig.filterImageWorkers   = 6
})
runner.schedule(WWParallelFilterBench,()=>{
    console.log("Setting workers to 8")
    BenchConfig.filterImageWorkers   = 8
})
runner.schedule(WWParallelFilterBench,()=>{
    console.log("Setting workers to 10")
    BenchConfig.filterImageWorkers   = 10
})
runner.schedule(WWParallelFilterBench,()=>{
    console.log("Setting workers to 12")
    BenchConfig.filterImageWorkers   = 12
})






runner.schedule(SequentialFilterBench)
console.log("Starting Client-side speedup benchmarks")
runner.nextBenchmark()