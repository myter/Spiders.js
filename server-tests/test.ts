import {SpiderObject} from "../src/MOP/MOP";

class SubObject extends SpiderObject{
    someSuperField = 5
    someFoo(){
        return 5
    }

}

class SubSubObject extends SubObject{
    someSubField = 10
    constructor(){
        super()
    }
    someOtherFoo(){
        return super.someFoo() + 10
    }
}

var o : any = new SubSubObject()
console.log(o.someOtherFoo())
console.log(o.someSuperField)
console.log(o.someSubField)