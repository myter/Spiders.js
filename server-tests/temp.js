Object.defineProperty(exports, "__esModule", { value: true });
const signal_1 = require("../src/ReactiveMS/signal");
var spiders = require("../src/spiders");
let source = new signal_1.Signal(5);
let inter1 = signal_1.lift((sourceSignalVal) => {
    return sourceSignalVal + 5;
})(source);
let inter2 = signal_1.lift((sourceSignalVal) => {
    return sourceSignalVal + 10;
})(source);
let sink = signal_1.lift((interVal1, interVal2) => {
    console.log("Updated val : " + interVal1 + " , " + interVal2);
})(inter1, inter2);
source.change(5);
source.change(6);
//# sourceMappingURL=temp.js.map