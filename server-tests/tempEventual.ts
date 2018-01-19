import {Eventual} from "../src/Onward/Eventual";

export class TestEventual extends Eventual{
    value

    constructor(){
        super()
        this.value = 0
    }

    inc(){
        this.value++
    }

    dec(){
        this.value--
    }
}