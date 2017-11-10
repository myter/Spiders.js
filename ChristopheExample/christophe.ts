import {SpiderLib} from "../src/spiders";
import {MicroService} from "../src/MicroService/MicroService";

var spiders : SpiderLib = require("../src/spiders")
class ExampleSignal extends spiders.Signal{

}

class ServiceA extends MicroService{

}

class ServiceB extends MicroService{

}