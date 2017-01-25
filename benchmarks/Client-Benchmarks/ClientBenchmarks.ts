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
runner.schedule(NatCigaretteSmokersBench)
console.log("Starting Benchmark")
runner.nextBenchmark()
