/*class Wayup{
    say(){
        console.log("I'm way up")
    }
}

class Sup extends Wayup{
    x = 5
    say(){
        console.log("I'm Sup " + this.x);
    }
}

class Bas extends Sup{
    say(){
        console.log("I'm Bas")
        //;((this.__proto__).__proto__).say.bind(this)()
    }
}
let b = new Bas()
b.say()*/

let s = "super.initialise(someArgs)"
function convert(inputString : string){
    let parts = inputString.match(/(super\.)(.*?\()(.*)/)
    parts[2] = parts[2].replace('(','.bind(this)(')
    return parts[1] + parts[2] + parts[3]
}
console.log(convert(s))
