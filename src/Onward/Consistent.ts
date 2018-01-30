import {SpiderLib} from "../spiders";
import {bundleScope, LexScope} from "../utils";

var spiders : SpiderLib = require("../spiders")
var _IS_CONSISTENT_KEY_ = "_IS_CONSISTENT_"
export class Consistent extends spiders.SpiderObject{
    constructor(){
        super(new ConsistentMirror())
        this[_IS_CONSISTENT_KEY_] = true
    }
}
export class ConsistentMirror extends spiders.SpiderObjectMirror{
    private checkArg(arg){
        if(arg instanceof Array){
            let wrongArgs = arg.filter((a)=>{
                return this.checkArg(a)
            })
            return wrongArgs.length > 0
        }
        else if(typeof arg == 'object'){
            //Does this look like I'm stupid ? Yes ! However undefined is not seen as a falsy value for filter while it is in the condition of an if ... go figure
            if(!arg[_IS_CONSISTENT_KEY_]){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }

    invoke(methodName : string,args : Array<any>){
        let wrongArgs = args.filter(this.checkArg)
        if(wrongArgs.length > 0){
            let message = "Cannot pas non-consistent arguments to consistent method call: " + methodName
            throw new Error(message)
        }
        else{
            return super.invoke(methodName,args)
        }
    }

    write(fieldName,value){
        if(this.checkArg(value)){
            throw new Error("Cannot assign non-consistent argument to consistent field")
        }
        else{
            return super.write(fieldName,value)
        }
    }
}
let consScope       = new LexScope()
consScope.addElement("ConsistentMirror",ConsistentMirror)
consScope.addElement("_IS_CONSISTENT_KEY_",_IS_CONSISTENT_KEY_)
bundleScope(Consistent,consScope)
let conMirrorScope  = new LexScope()
conMirrorScope.addElement("_IS_CONSISTENT_KEY_",_IS_CONSISTENT_KEY_)
bundleScope(ConsistentMirror,conMirrorScope)