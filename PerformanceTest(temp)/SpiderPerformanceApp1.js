Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require('../src/spiders');
class App extends spiders.Application {
    constructor() {
        super("127.0.0.1", 8882);
        this.remote("127.0.0.1", 8881).then((ref) => {
            this.start = Date.now();
            ref.receive(this).then((stop) => {
                console.log("Time taken: " + (stop - this.start));
            });
        });
    }
    answer(stop) {
        console.log("Time taken return: " + (stop - this.start));
    }
}
new App();
//# sourceMappingURL=SpiderPerformanceApp1.js.map