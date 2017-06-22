Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
const sequentialCarlo_1 = require("./sequentialCarlo");
const SpiderCarlo_1 = require("./SpiderCarlo");
/**
 * Created by flo on 19/02/2017.
 */
var runner = new benchUtils_1.SpiderBenchmarkRunner();
runner.schedule(sequentialCarlo_1.SequentialCarloBench, () => {
    console.log("Sequential runs = 12");
    benchUtils_1.BenchConfig.monteCarloRuns = 12;
});
runner.schedule(SpiderCarlo_1.SpiderCarloBench, () => {
    console.log("Spider workers = 12");
    benchUtils_1.BenchConfig.monteCarloRuns = 12;
    benchUtils_1.BenchConfig.monteCarloWorkers = 12;
});
runner.schedule(SpiderCarlo_1.SpiderCarloBench, () => {
    console.log("Spider workers = 10");
    benchUtils_1.BenchConfig.monteCarloRuns = 12;
    benchUtils_1.BenchConfig.monteCarloWorkers = 10;
});
runner.schedule(SpiderCarlo_1.SpiderCarloBench, () => {
    console.log("Spider workers = 8");
    benchUtils_1.BenchConfig.monteCarloRuns = 12;
    benchUtils_1.BenchConfig.monteCarloWorkers = 8;
});
runner.schedule(SpiderCarlo_1.SpiderCarloBench, () => {
    console.log("Spider workers = 6");
    benchUtils_1.BenchConfig.monteCarloRuns = 12;
    benchUtils_1.BenchConfig.monteCarloWorkers = 6;
});
runner.schedule(SpiderCarlo_1.SpiderCarloBench, () => {
    console.log("Spider workers = 4");
    benchUtils_1.BenchConfig.monteCarloRuns = 12;
    benchUtils_1.BenchConfig.monteCarloWorkers = 4;
});
runner.schedule(SpiderCarlo_1.SpiderCarloBench, () => {
    console.log("Spider workers = 2");
    benchUtils_1.BenchConfig.monteCarloRuns = 12;
    benchUtils_1.BenchConfig.monteCarloWorkers = 2;
});
// runner.schedule(SequentialCarloBench,()=>{
//     console.log("Sequential runs = 12")
//     BenchConfig.sequentialMonteCarloRuns = 12
// })
// runner.schedule(WWCarloBench,()=>{
//     console.log("Web workers = 12")
//     BenchConfig.monteCarloWorkers = 12
// })
//
// runner.schedule(SequentialCarloBench,()=>{
//     console.log("Sequential runs = 10")
//     BenchConfig.sequentialMonteCarloRuns = 10
// })
// runner.schedule(WWCarloBench,()=>{
//     console.log("Web workers = 10")
//     BenchConfig.monteCarloWorkers = 10
// })
//
// runner.schedule(SequentialCarloBench,()=>{
//     console.log("Sequential runs = 8")
//     BenchConfig.sequentialMonteCarloRuns = 8
// })
// runner.schedule(WWCarloBench,()=>{
//     console.log("Web workers = 8")
//     BenchConfig.monteCarloWorkers = 8
// })
//
// runner.schedule(SequentialCarloBench,()=>{
//     console.log("Sequential runs = 6")
//     BenchConfig.sequentialMonteCarloRuns = 6
// })
// runner.schedule(WWCarloBench,()=>{
//     console.log("Web workers = 6")
//     BenchConfig.monteCarloWorkers = 6
// })
//
// runner.schedule(SequentialCarloBench,()=>{
//     console.log("Sequential runs = 4")
//     BenchConfig.sequentialMonteCarloRuns = 4
// })
// runner.schedule(WWCarloBench,()=>{
//     console.log("Web workers = 4")
//     BenchConfig.monteCarloWorkers = 4
// })
//
// runner.schedule(SequentialCarloBench,()=>{
//     console.log("Sequential runs = 2")
//     BenchConfig.sequentialMonteCarloRuns = 2
// })
// runner.schedule(WWCarloBench,()=>{
//     console.log("Web workers = 2")
//     BenchConfig.monteCarloWorkers = 2
// })
console.log("Starting Client-side speedup benchmarks");
runner.nextBenchmark();
//# sourceMappingURL=ClientSpeedupBenchmarks.js.map