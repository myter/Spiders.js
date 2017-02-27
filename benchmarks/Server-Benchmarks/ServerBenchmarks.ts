import {SpiderBenchmarkRunner} from "../benchUtils";
import {NodePingPongBench} from "./Ping-Pong/PingPongMain";
import {NodeCountBench} from "./Counting/CountMain";
import {NodeFJThroughputBench} from "./Fork-Join-Throughput/FJThroughputMain";
import {NodeFJCreationBench} from "./Fork-Join-Creation/FJCreationMain";
import {NodeThreadRingBench} from "./Thread-Ring/ThreadRingMain";
import {NodeChameneoBench} from "./Chameneos/ChameneoMain";
import {NodeBigBench} from "./Big/BigMain";
import {NodeConcurrentDictionaryBench} from "./Concurrent-Dictionary/ConcurrentDictionaryMain";
import {NodeConcurrentLinkedListBench} from "./Concurrent-Linked-List/ConcurrentLinkedListMain";
import {NodeProducerConsumerBench} from "./Producer-Consumer/ProducerConsumerMain";
import {NodeDiningPhilosopherBench} from "./Dining-Philosophers/DiningPhilosophersMain";
import {NodeSleepingBarberBench} from "./Sleeping-Barber/SleepingBarberMain";
import {NodeCigaretteSmokersBench} from "./Cigarette-Smokers/CigaretteSmokersMain";
import {NodeLogisticMapSeriesBench} from "./Logistic-Map-Series/LogisticMapSeriesMain";
import {NodeBankTransactionBench} from "./Bank-Transaction/BankTransactionMain";
import {NodeRadixSortBench} from "./Radix-Sort/RadixSortMain";
import {NodeFilterBankBench} from "./Filter-Bank/FilterBankMain";
import {NodeSieveOfEratosthenesBench} from "./Sieve-Of-Eratosthenes/SieveOfEratosthenesMain";
import {NodeUnbalancedCobwebbedTreeBench} from "./Unbalanced-Cobwebbed-Tree/UnbalancedCobwebbedTreeMain";
import {NodeFacilityLocationBench} from "./Online-Facility-Location/OnlineFacilityLocationMain";
import {NodeTrapezoidalApproximationBench} from "./Trapezoidal-Approximation/TrapezoidalApproximationMain";
import {NodePrecisePiComputationBench} from "./Precise-Pi-Computation/PrecisePiComputationMain";
import {NodeRecursiveMatrixMultiplicationBench} from "./Recursive-Matrix-Multiplication/RecursiveMatrixMultiplicationMain";
import {NodeQuicksortBench} from "./Quicksort/QuicksortMain";
import {NodeAllPairShortestPathBench} from "./All-Pairs-Shortest-Path/AllPairShortestPathMain";
import {NodeSuccessiveOverRelaxationBench} from "./Successive-Over-Relaxation/SuccessiveOverRelaxationMain";
import {NodeAStarSearchBench} from "./A-Star-Search/AStarSearchMain";
import {NodeNQueensFirstNSolutionsBench} from "./N-Queens-First-N-Solutions/NQueensFirstNSolutionsMain";
import {SpiderPinPongBench} from "../Client-Benchmarks/Spiders/PingPong";
import {SpiderCountingActorBench} from "../Client-Benchmarks/Spiders/CountingActor";
import {SpiderForkJoinThroughputBench} from "../Client-Benchmarks/Spiders/ForkJoin-Throughput";
import {SpiderForkJoinCreationBench} from "../Client-Benchmarks/Spiders/ForkJoin-Creation";
import {SpiderThreadRingBench} from "../Client-Benchmarks/Spiders/ThreadRing";
import {SpiderChameneoBench} from "../Client-Benchmarks/Spiders/Chameneos";
import {SpiderBigBench} from "../Client-Benchmarks/Spiders/Big";
import {SpiderConcurrentDictionaryBench} from "../Client-Benchmarks/Spiders/ConcurrentDictionary";
import {SpiderConcurrentSortedLinkedListBench} from "../Client-Benchmarks/Spiders/ConcurrentSortedLinkedList";
import {SpiderProducerConsumerBench} from "../Client-Benchmarks/Spiders/ProducerConsumer";
import {SpiderDiningPhilosophersBench} from "../Client-Benchmarks/Spiders/DiningPhilosophers";
import {SpiderSleepingBarberBench} from "../Client-Benchmarks/Spiders/SleepingBarber";
import {SpiderCigaretteSmokersBench} from "../Client-Benchmarks/Spiders/CigaretteSmokers";
import {SpiderLogisticMapSeriesBench} from "../Client-Benchmarks/Spiders/LogisticMapSeries";
import {SpiderBankTransactionBench} from "../Client-Benchmarks/Spiders/BankTransaction";
import {SpiderRadixSortBench} from "../Client-Benchmarks/Spiders/RadixSort";
import {SpiderFilterBankBench} from "../Client-Benchmarks/Spiders/FilterBank";
import {SpiderSieveOfEratosthenesBench} from "../Client-Benchmarks/Spiders/SieveOfEratosthenes";
import {SpiderUnbalancedCobwebbedTreeBench} from "../Client-Benchmarks/Spiders/UnbalancedCobwebbedTree";
import {SpiderOnlineFacilityLocationBench} from "../Client-Benchmarks/Spiders/OnlineFacilityLocation";
import {SpiderTrapezoidalApproximationBench} from "../Client-Benchmarks/Spiders/TrapezoidalApproximation";
import {SpiderPrecisePiComputationBench} from "../Client-Benchmarks/Spiders/PrecisePiComputation";
import {SpiderRecursiveMatrixMultiplicationBench} from "../Client-Benchmarks/Spiders/RecursiveMatrixMultiplication";
import {SpiderQuickSortBench} from "../Client-Benchmarks/Spiders/QuickSort";
import {SpiderAllPairShortestPathBench} from "../Client-Benchmarks/Spiders/AllPairShortestPath";
import {SpiderSuccessiveOverRelaxationBench} from "../Client-Benchmarks/Spiders/SuccessiveOverRelaxation";
import {SpiderAStarSearchBench} from "../Client-Benchmarks/Spiders/AStarSearch";
import {SpiderNQueensFirstNSolutionsBench} from "../Client-Benchmarks/Spiders/NQueensFirstNSolutions";
/**
 * Created by flo on 07/02/2017.
 */
var runner = new SpiderBenchmarkRunner()
/*runner.schedule(NodePingPongBench)
runner.schedule(SpiderPinPongBench)

runner.schedule(NodeCountBench)
runner.schedule(SpiderCountingActorBench)

runner.schedule(NodeFJThroughputBench)
runner.schedule(SpiderForkJoinThroughputBench)

runner.schedule(NodeFJCreationBench)
runner.schedule(SpiderForkJoinCreationBench)

runner.schedule(NodeThreadRingBench)
runner.schedule(SpiderThreadRingBench)

runner.schedule(NodeChameneoBench)
runner.schedule(SpiderChameneoBench)

runner.schedule(NodeBigBench)
runner.schedule(SpiderBigBench)

runner.schedule(NodeConcurrentDictionaryBench)
runner.schedule(SpiderConcurrentDictionaryBench)
runner.schedule(NodeConcurrentLinkedListBench)
runner.schedule(SpiderConcurrentSortedLinkedListBench)

runner.schedule(NodeProducerConsumerBench)
runner.schedule(SpiderProducerConsumerBench)

runner.schedule(NodeDiningPhilosopherBench)
runner.schedule(SpiderDiningPhilosophersBench)

runner.schedule(NodeSleepingBarberBench)
runner.schedule(SpiderSleepingBarberBench)

runner.schedule(NodeCigaretteSmokersBench)
runner.schedule(SpiderCigaretteSmokersBench)

runner.schedule(NodeLogisticMapSeriesBench)
runner.schedule(SpiderLogisticMapSeriesBench)*/

/*runner.schedule(NodeBankTransactionBench)
runner.schedule(SpiderBankTransactionBench)*/

/*runner.schedule(NodeRadixSortBench)
runner.schedule(SpiderRadixSortBench)

runner.schedule(NodeFilterBankBench)
runner.schedule(SpiderFilterBankBench)

runner.schedule(NodeSieveOfEratosthenesBench)
runner.schedule(SpiderSieveOfEratosthenesBench)

runner.schedule(NodeUnbalancedCobwebbedTreeBench)
runner.schedule(SpiderUnbalancedCobwebbedTreeBench)

runner.schedule(NodeFacilityLocationBench)
runner.schedule(SpiderOnlineFacilityLocationBench)

runner.schedule(NodeTrapezoidalApproximationBench)
runner.schedule(SpiderTrapezoidalApproximationBench)

runner.schedule(NodePrecisePiComputationBench)
runner.schedule(SpiderPrecisePiComputationBench)

runner.schedule(NodeRecursiveMatrixMultiplicationBench)
runner.schedule(SpiderRecursiveMatrixMultiplicationBench)

/*runner.schedule(NodeQuicksortBench)
runner.schedule(SpiderQuickSortBench)*/

/*runner.schedule(NodeAllPairShortestPathBench)
runner.schedule(SpiderAllPairShortestPathBench)

runner.schedule(NodeSuccessiveOverRelaxationBench)
runner.schedule(SpiderSuccessiveOverRelaxationBench)

runner.schedule(NodeAStarSearchBench)
runner.schedule(SpiderAStarSearchBench)

runner.schedule(NodeNQueensFirstNSolutionsBench)
runner.schedule(SpiderNQueensFirstNSolutionsBench)*/

runner.schedule(NodeQuicksortBench)
//runner.schedule(SpiderQuickSortBench)

console.log("Starting server (final) benchmarks")
runner.nextBenchmark()