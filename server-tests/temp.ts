import {makeMethodAnnotation} from "../src/utils";
import {Application, SpiderIsolate, SpiderObject,SpiderObjectMirror,Actor,SpiderActorMirror} from "../src/spiders";


let app = new Application()
app.spawnActorFromFile(__dirname+"/testActorDefinition","TestActor",["hello",app])
