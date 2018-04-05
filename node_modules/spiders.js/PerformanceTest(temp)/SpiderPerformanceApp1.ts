import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require('../src/spiders')

class App extends spiders.Application{
    start

    constructor(){
        super("127.0.0.1",8882)
        this.remote("127.0.0.1",8881).then((ref)=>{
            this.start = Date.now()
            ref.receive(this).then((stop)=>{
                console.log("Time taken: " + (stop - this.start))
            })
        })
    }

    answer(stop){
        console.log("Time taken return: " + (stop - this.start))
    }
}
new App()