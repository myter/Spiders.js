import {Eventual} from "../src/Onward/Eventual";
import {SpiderIsolate, SpiderIsolateMirror} from "../src/MOP";

export class TestEventual extends Eventual{
    value

    inc(){
        this.value++
    }

    dec(){
        this.value--
    }
}

/*export class TestIsolMirror extends SpiderIsolateMirror{
    invoke(methodName,args){
        if(methodName != "setO"){
            console.log("Checking for object in isol")
            console.log((this.base as TestIsolate).someObField)
        }
        else{
            super.invoke(methodName,args)
        }
    }
}
export class TestIsolate extends SpiderIsolate{
    someIsolField
    someObField

    constructor(i,o){
        super(new TestIsolMirror())
        this.someIsolField  = i
        this.someObField    = o
    }

    setO(o){
        this.someObField = o
    }

    doSomething(){

    }
}*/