import {Eventual} from "../src/Onward/Eventual";

export class TestEventual extends Eventual{
    value

    inc(){
        this.value++
    }

    dec(){
        this.value--
    }
}