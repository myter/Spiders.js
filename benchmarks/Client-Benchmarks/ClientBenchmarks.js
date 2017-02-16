const benchUtils_1 = require("../benchUtils");
const ForkJoin_Creation_1 = require("./Spiders/ForkJoin-Creation");
/**
 * Created by flo on 24/01/2017.
 */
//Chrome seems to dislike the allocation and deallocation of web workers.Run benchmarks seperately to get most stable results
var runner = new benchUtils_1.SpiderBenchmarkRunner();
//runner.schedule(NatPingPongBench)
//runner.schedule(NatCountBench)
//runner.schedule(NatFJThroughputBench)
//runner.schedule(NatFJCreationBench) //TODO weird scheduling stuff ?
// runner.schedule(NatThreadRing)
// runner.schedule(NatChameneoBench)
// runner.schedule(NatBigBench)
// runner.schedule(NatConcurrentDictionaryBench)
// runner.schedule(NatConcurrentLinkedListBench)
// runner.schedule(NatProducerConsumerBench)
// runner.schedule(NatDiningPhilosopherBench)
// runner.schedule(NatSleepingBarberBench)
// runner.schedule(NatCigaretteSmokersBench)
// runner.schedule(NatLogisticMapSeriesBench)
//runner.schedule(NatBankTransactionBench) TODO problem here (not starting)
/*runner.schedule(NatRadixSortBench)
runner.schedule(NatFilterBankBench)
runner.schedule(NatSieveOfEratosthenesBench)
runner.schedule(NatUnbalancedCobwebbedTreeBench)
runner.schedule(NatFacilityLocationBench)
runner.schedule(NatTrapezoidalApproximationBench)
runner.schedule(NatPrecisePiComputationBench)
runner.schedule(NatRecursiveMatrixMultiplicationBench)
runner.schedule(NatQuicksortBench)
runner.schedule(NatAllPairShortestPathBench)
runner.schedule(NatSuccessiveOverRelaxationBench)
runner.schedule(NatAStarSearchBench)
runner.schedule(NatNQueensFirstNSolutionsBench)*/
// runner.schedule(SpiderPinPongBench)
// runner.schedule(SpiderCountingActorBench)
// runner.schedule(SpiderForkJoinThroughputBench)
// runner.schedule(SpiderForkJoinCreationBench)
// runner.schedule(SpiderThreadRingBench)
// runner.schedule(SpiderChameneoBench)
// runner.schedule(SpiderBigBench)
// runner.schedule(SpiderConcurrentDictionaryBench)
// runner.schedule(SpiderConcurrentSortedLinkedListBench)
// runner.schedule(SpiderProducerConsumerBench)
// runner.schedule(SpiderDiningPhilosophersBench)
// runner.schedule(SpiderSleepingBarberBench)
// runner.schedule(SpiderCigaretteSmokersBench)
// runner.schedule(SpiderLogisticMapSeriesBench)
// runner.schedule(SpiderBankTransactionBench)
// runner.schedule(SpiderRadixSortBench)
// runner.schedule(SpiderFilterBankBench)
// runner.schedule(SpiderSieveOfEratosthenesBench)
// runner.schedule(SpiderUnbalancedCobwebbedTreeBench)
// runner.schedule(SpiderOnlineFacilityLocationBench)
// runner.schedule(SpiderTrapezoidalApproximationBench)
// runner.schedule(SpiderPrecisePiComputationBench)
// runner.schedule(SpiderRecursiveMatrixMultiplicationBench)
// runner.schedule(SpiderQuickSortBench)
// runner.schedule(SpiderAllPairShortestPathBench)
// runner.schedule(SpiderSuccessiveOverRelaxationBench)
// runner.schedule(SpiderAStarSearchBench)
// runner.schedule(SpiderNQueensFirstNSolutionsBench)
runner.schedule(ForkJoin_Creation_1.SpiderForkJoinCreationBench);
//runner.schedule(NatFJCreationBench)
console.log("Starting Benchmark");
runner.nextBenchmark();
//# sourceMappingURL=ClientBenchmarks.js.map