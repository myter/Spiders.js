import {SpiderLib} from "../src/spiders";
import {lift, Signal} from "../src/ReactiveMS/signal";
var spiders : SpiderLib = require("../src/spiders")

let source = new Signal(5)

let inter1 = lift((sourceSignalVal)=>{
  return sourceSignalVal + 5
})(source)

let inter2 = lift((sourceSignalVal)=>{
    return sourceSignalVal + 10
})(source)

let sink = lift((interVal1,interVal2)=>{
    console.log("Updated val : " + interVal1 + " , " + interVal2)
})(inter1,inter2)

source.change(5)
source.change(6)
