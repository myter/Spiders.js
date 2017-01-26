import {SpiderBenchmarkRunner} from "../benchUtils";
import {NatPingPongBench} from "./Native/Ping-Pong/PingPongMain";
import {NatCountBench} from "./Native/Counting/CountMain";
import {NatFJThroughputBench} from "./Native/Fork-Join-Throughput/FJThroughputMain";
import {NatFJCreationBench} from "./Native/Fork-Join-Creation/FJCreationMain";
import {NatThreadRing} from "./Native/Thread-ring/ThreadRingMain";
import {NatChameneoBench} from "./Native/Chameneos/ChameneoMain";
import {NatBigBench} from "./Native/Big/BigMain";
import {NatConcurrentDictionaryBench} from "./Native/Concurrent-Dictionary/ConcurrentDictionaryMain";
import {NatConcurrentLinkedListBench} from "./Native/Concurrent-Linked-List/ConcurrentLinkedListMain";
import {NatProducerConsumerBench} from "./Native/Producer-Consumer/ProducerConsumerMain";
import {NatDiningPhilosopherBench} from "./Native/Dining-Philosophers/DiningPhilosophersMain";
import {NatSleepingBarberBench} from "./Native/Sleeping-Barber/SleepingBarberMain";
import {NatCigaretteSmokersBench} from "./Native/Cigarette-Smokers/CigaretteSmokersMain";
import {NatLogisticMapSeriesBench} from "./Native/Logistic-Map-Series/LogisticMapSeriesMain";
import {NatBankTransactionBench} from "./Native/Bank-Transaction/BankTransactionMain";
import {NatRadixSortBench} from "./Native/Radix-Sort/RadixSortMain";
import {NatFilterBankBench} from "./Native/Filter-Bank/FilterBankMain";
import {NatSieveOfEratosthenesBench} from "./Native/Sieve-Of-Eratosthenes/SieveOfEratosthenesMain";
import {NatUnbalancedCobwebbedTreeBench} from "./Native/Unbalanced-Cobwebbed-Tree/UnbalancedCobwebbedTreeMain";
import {NatFacilityLocationBench} from "./Native/Online-Facility-Location/FacilityLocationMain";
import {NatTrapezoidalApproximationBench} from "./Native/Trapezoidal-Approximation/TrapezoidalApproximationMain";
import {NatPrecisePiComputationBench} from "./Native/Precise-Pi-Computation/PrecisePiComputationMain";
import {NatRecursiveMatrixMultiplicationBench} from "./Native/Recursive-Matrix-Multiplication/RecursiveMatrixMultiplicationMain";
import {NatQuicksortBench} from "./Native/Quicksort/QuicksortMain";
import {NatAllPairShortestPathBench} from "./Native/All-Pairs-Shortest-Path/AllPairShortestPathMain";
import {NatSuccessiveOverRelaxationBench} from "./Native/Successive-Over-Relaxation/SuccessiveOverRelaxationMain";
import {NatAStarSearchBench} from "./Native/A-Star-Search/AStarSearchMain";
import {NatNQueensFirstNSolutionsBench} from "./Native/N-Queens-First-N-Solutions/NQueensFirstNSolutionsMain";
/**
 * Created by flo on 24/01/2017.
 */
var runner = new SpiderBenchmarkRunner()
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
runner.schedule(NatNQueensFirstNSolutionsBench)
console.log("Starting Benchmark")
runner.nextBenchmark()
