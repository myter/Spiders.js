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
/**
 * Created by flo on 07/02/2017.
 */
var runner = new SpiderBenchmarkRunner()
//runner.schedule(NodePingPongBench)
//runner.schedule(NodeCountBench)
//runner.schedule(NodeFJThroughputBench)
//runner.schedule(NodeFJCreationBench)
//runner.schedule(NodeThreadRingBench)
//runner.schedule(NodeChameneoBench)
//runner.schedule(NodeBigBench)
//runner.schedule(NodeConcurrentDictionaryBench)
//runner.schedule(NodeConcurrentLinkedListBench)
//runner.schedule(NodeProducerConsumerBench)
//runner.schedule(NodeDiningPhilosopherBench)
//runner.schedule(NodeSleepingBarberBench)
//runner.schedule(NodeCigaretteSmokersBench)
//runner.schedule(NodeLogisticMapSeriesBench)
//runner.schedule(NodeBankTransactionBench)
//runner.schedule(NodeRadixSortBench)
//runner.schedule(NodeFilterBankBench)
//runner.schedule(NodeSieveOfEratosthenesBench)
//runner.schedule(NodeUnbalancedCobwebbedTreeBench)
//runner.schedule(NodeFacilityLocationBench)
//runner.schedule(NodeTrapezoidalApproximationBench)
//runner.schedule(NodePrecisePiComputationBench)
//runner.schedule(NodeRecursiveMatrixMultiplicationBench)
//runner.schedule(NodeQuicksortBench)
//runner.schedule(NodeAllPairShortestPathBench)
//runner.schedule(NodeSuccessiveOverRelaxationBench)
//runner.schedule(NodeAStarSearchBench)
runner.schedule(NodeNQueensFirstNSolutionsBench)
console.log("Starting server benchmarks")
runner.nextBenchmark()