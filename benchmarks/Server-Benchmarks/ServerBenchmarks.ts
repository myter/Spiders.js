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
runner.schedule(NodeLogisticMapSeriesBench)
console.log("Starting server benchmarks")
runner.nextBenchmark()