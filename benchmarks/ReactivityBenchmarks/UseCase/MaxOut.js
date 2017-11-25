Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../../../src/MicroService/MicroService");
const ServiceMonitor_1 = require("../../../src/MicroService/ServiceMonitor");
const SubTag_1 = require("../../../src/PubSub/SubTag");
var ProducerTag = new SubTag_1.PubSubTag("Producer");
var consumerTag = new SubTag_1.PubSubTag("Consumer");
class Producer extends MicroService_1.MicroServiceApp {
    constructor() {
        super("127.0.0.1", 8002);
        this.val = 0;
        this.subscribe(consumerTag).once((consuRef) => {
            this.fload(consuRef, 0);
        });
    }
    fload(ref, times) {
        if (times < 30) {
            setTimeout(() => {
                for (var i = 0; i < 10000; i++) {
                    this.val++;
                    ref.print(this.val);
                }
                this.fload(ref, times++);
            }, 100);
        }
    }
}
class Consumer extends MicroService_1.MicroServiceApp {
    constructor() {
        super("127.0.0.1", 8001);
        this.publish(this, consumerTag);
    }
    print(v) {
        if (this.prevV && v != this.prevV + 1) {
            console.log("WENT WRONG");
            process.exit();
        }
        console.log(v);
        this.prevV = v;
    }
}
let toSpawn = process.argv[2];
switch (toSpawn) {
    case "monitor":
        new ServiceMonitor_1.ServiceMonitor();
        break;
    case "prod":
        new Producer();
        break;
    case "con":
        new Consumer();
        break;
    default:
        throw new Error("unknown spawning argument");
}
//# sourceMappingURL=MaxOut.js.map