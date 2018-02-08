import {PSClient} from "./PubSub/SubClient";
import {ActorEnvironment} from "./ActorEnvironment";
import {PSServer} from "./PubSub/SubServer";
import {PubSubTag} from "./PubSub/SubTag";

export class ActorSTDLib{
    environment : ActorEnvironment
    PubSubTag   : {new(tagVal : string) : PubSubTag}
    constructor(env){
        this.environment = env
        this.PubSubTag   = PubSubTag
    }

    setupPSClient(address : string = "127.0.0.1",port : number = 8000) : PSClient{
        return new PSClient(this.environment.behaviourObject,address,port)
    }

    setupPSServer(){
        this.environment.behaviourObject["_PS_SERVER_"] = new PSServer()
    }
}