const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 24/01/2017.
 */
//Chrome seems to dislike the allocation and deallocation of web workers. Run benchmark pair-wise to avoid 404 errors due to chrome not being able to allocate webworker
var runner = new benchUtils_1.SpiderBenchmarkRunner();
/*runner.schedule(NatPingPongBench)
runner.schedule(SpiderPinPongBench)*/
/*runner.schedule(NatCountBench)
runner.schedule(SpiderCountingActorBench)*/
/*runner.schedule(NatFJThroughputBench)
runner.schedule(SpiderForkJoinThroughputBench)

runner.schedule(NatFJCreationBench)
runner.schedule(SpiderForkJoinCreationBench)*/
/*runner.schedule(NatThreadRing)
runner.schedule(SpiderThreadRingBench)

runner.schedule(NatChameneoBench)
runner.schedule(SpiderChameneoBench)

runner.schedule(NatBigBench)
runner.schedule(SpiderBigBench)*/
/*runner.schedule(NatConcurrentDictionaryBench)
runner.schedule(SpiderConcurrentDictionaryBench)

runner.schedule(NatConcurrentLinkedListBench)
runner.schedule(SpiderConcurrentSortedLinkedListBench)*/
/*runner.schedule(NatProducerConsumerBench)
runner.schedule(SpiderProducerConsumerBench)

runner.schedule(NatDiningPhilosopherBench)
runner.schedule(SpiderDiningPhilosophersBench)

runner.schedule(NatSleepingBarberBench)
runner.schedule(SpiderSleepingBarberBench)*/
/*runner.schedule(NatCigaretteSmokersBench)
runner.schedule(SpiderCigaretteSmokersBench)

runner.schedule(NatLogisticMapSeriesBench)
runner.schedule(SpiderLogisticMapSeriesBench)

runner.schedule(NatBankTransactionBench)
runner.schedule(SpiderBankTransactionBench)*/
/*runner.schedule(NatRadixSortBench)
runner.schedule(SpiderRadixSortBench)

runner.schedule(NatFilterBankBench)
runner.schedule(SpiderFilterBankBench)

runner.schedule(NatSieveOfEratosthenesBench)
runner.schedule(SpiderSieveOfEratosthenesBench)

runner.schedule(NatUnbalancedCobwebbedTreeBench)
runner.schedule(SpiderUnbalancedCobwebbedTreeBench)*/
/*runner.schedule(NatFacilityLocationBench)
runner.schedule(SpiderOnlineFacilityLocationBench)*/
/*runner.schedule(NatTrapezoidalApproximationBench)
runner.schedule(SpiderTrapezoidalApproximationBench)*/
/*runner.schedule(NatPrecisePiComputationBench)
runner.schedule(SpiderPrecisePiComputationBench)*/
/*runner.schedule(NatRecursiveMatrixMultiplicationBench)
runner.schedule(SpiderRecursiveMatrixMultiplicationBench)*/
/*runner.schedule(NatQuicksortBench)
runner.schedule(SpiderQuickSortBench)*/
/*runner.schedule(NatAllPairShortestPathBench)
runner.schedule(SpiderAllPairShortestPathBench)

runner.schedule(NatSuccessiveOverRelaxationBench)
runner.schedule(SpiderSuccessiveOverRelaxationBench)*/
/*runner.schedule(NatAStarSearchBench)
runner.schedule(SpiderAStarSearchBench)

runner.schedule(NatNQueensFirstNSolutionsBench)
runner.schedule(SpiderNQueensFirstNSolutionsBench)*/
console.log("Starting Benchmark");
runner.nextBenchmark();
//# sourceMappingURL=ClientBenchmarks.js.map