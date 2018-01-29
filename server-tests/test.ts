import {Available} from "../src/Onward/Available";
import {clone} from "../src/utils";

class X{
    someVal
    constructor(){
        this.someVal = 5
    }
}

X["foo"] = new Map()
X["foo"].set("a",1)
let x = new X()
let xx = clone(x)
xx