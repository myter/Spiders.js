import {SpiderLib} from "../src/spiders";
import {ServiceMonitor} from "../src/MicroService/ServiceMonitor";
var spiders : SpiderLib = require("../src/spiders")
spiders.setupReactNative()
let app = new spiders.Application()

