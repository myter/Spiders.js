import {SpiderLib} from "../src/spiders";
/**
 * Created by flo on 30/06/2017.
 */
var spiders : SpiderLib = require("../src/spiders")
export class TestActor extends spiders.Actor{
    getValue(){
        return 5
    }
}