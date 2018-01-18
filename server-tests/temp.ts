import {SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";
import {TestEventual} from "./tempEventual";
import {Eventual} from "../src/Onward/Eventual";


var spiders : SpiderLib = require("../src/spiders")



class Actor1 extends CAPActor{
    thisDirectory
    constructor(){
       super()
        this.thisDirectory = __dirname
    }

    share(withRef){
        let TestEventual = require(this.thisDirectory + "/tempEventual").TestEventual
        let ev = new TestEventual()
        withRef.get(ev)
    }
}

class Actor2 extends CAPActor{
    get(anEv : TestEventual){
        anEv.dec()
    }
}
let app = new spiders.Application()
let act1 = app.spawnActor(Actor1)
let act2 = app.spawnActor(Actor2)
act1.share(act2)

/*function convert(inputString : string){
    let reg     = new RegExp(/(super\.)(.*?\()((.|[\r\n])*)/)
    //let parts   = inputString.match(/(super\.)(.*?\()((.|[\r\n])*)/)
    let parts   = inputString.match(reg)
    parts[2]    = parts[2].replace('(','.bind(this)(')
    let prefix  = inputString.substring(0,parts.index)
    if(parts[3].match(reg)){
        return prefix + parts[1]+ parts[2] + convert(parts[3])
    }
    else{
        return prefix + parts[1]+ parts[2] + parts[3]
    }
}

function constructMethod(functionSource){
    //JS disallows the use of super outside of method context (which is the case if you eval a function as a string)
    //Replace all supers with proto calls
    if(functionSource.includes("super")){
        console.log("Function contains super : " + functionSource)
        functionSource = convert(functionSource)
        functionSource = functionSource.replace(new RegExp("super", 'g'),"((this.__proto__).__proto__)")
        console.log("Replaced : " + functionSource)
    }
    if(functionSource.startsWith("function")){
        var method =  eval( "(" +  functionSource +")" )
    }
    else{
        var method =  eval("(function " + functionSource + ")" )
    }
    return method
}
let testSource = "invoke(methodName,args){" +
    "super.something() \n" +
    "super.anotherThing()" +
    "}"
console.log(constructMethod(testSource))*/
