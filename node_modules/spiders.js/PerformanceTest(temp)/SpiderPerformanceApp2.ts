import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require('../src/spiders')

class App extends spiders.Application{
    constructor(){
        super("127.0.0.1",8881)
    }

    receive(sender){
        sender.answer(Date.now())
        return Date.now()
    }
}

new App()