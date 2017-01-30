const benchUtils_1 = require("../benchUtils");
const SieveOfEratosthenes_1 = require("./Spiders/SieveOfEratosthenes");
/**
 * Created by flo on 24/01/2017.
 */
var runner = new benchUtils_1.SpiderBenchmarkRunner();
//runner.schedule(NatPingPongBench)
//runner.schedule(NatCountBench)
//runner.schedule(NatFJThroughputBench)
//runner.schedule(NatFJCreationBench)
//runner.schedule(NatThreadRing)
//runner.schedule(NatChameneoBench)
//runner.schedule(NatBigBench)
//runner.schedule(NatConcurrentDictionaryBench)
//runner.schedule(NatConcurrentLinkedListBench)
//runner.schedule(NatProducerConsumerBench)
//runner.schedule(NatDiningPhilosopherBench)
//runner.schedule(NatSleepingBarberBench)
//runner.schedule(NatCigaretteSmokersBench)
//runner.schedule(NatLogisticMapSeriesBench)
//runner.schedule(NatBankTransactionBench)
//runner.schedule(NatRadixSortBench)
//runner.schedule(NatFilterBankBench)
//runner.schedule(NatSieveOfEratosthenesBench)
//runner.schedule(NatUnbalancedCobwebbedTreeBench)
//runner.schedule(NatFacilityLocationBench)
//runner.schedule(NatTrapezoidalApproximationBench)
//runner.schedule(NatPrecisePiComputationBench)
//runner.schedule(NatRecursiveMatrixMultiplicationBench)
//runner.schedule(NatQuicksortBench)
//runner.schedule(NatAllPairShortestPathBench)
//runner.schedule(NatSuccessiveOverRelaxationBench)
//runner.schedule(NatAStarSearchBench)
//runner.schedule(NatNQueensFirstNSolutionsBench)
//runner.schedule(SpiderPinPongBench)
//runner.schedule(SpiderCountingActorBench)
//runner.schedule(SpiderForkJoinThroughputBench)
//runner.schedule(SpiderForkJoinCreationBench)
//runner.schedule(SpiderThreadRingBench)
//runner.schedule(SpiderChameneoBench)
//runner.schedule(SpiderBigBench)
//runner.schedule(SpiderConcurrentDictionaryBench)
//runner.schedule(SpiderConcurrentDictionaryBench)
//runner.schedule(SpiderProducerConsumerBench)
//runner.schedule(SpiderDiningPhilosophersBench)
//runner.schedule(SpiderSleepingBarberBench)
//runner.schedule(SpiderCigaretteSmokersBench)
//runner.schedule(SpiderLogisticMapSeriesBench)
//runner.schedule(SpiderRadixSortBench)
//runner.schedule(SpiderFilterBankBench)
runner.schedule(SieveOfEratosthenes_1.SpiderSieveOfEratosthenesBench);
console.log("Starting Benchmark");
runner.nextBenchmark();
//# sourceMappingURL=ClientBenchmarks.js.map