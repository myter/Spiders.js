import { Application, FarRef,Actor} from "../src/spiders";

class TestActor extends Actor{
    foo() : Promise<boolean>{
        console.log("Foo invoked")
        return true as any
    }

    bar() : Promise<any>{
        return undefined
    }
}

class TestApp extends Application{

}
let app  = new TestApp()
let act : FarRef<TestActor> = app.spawnActor(TestActor)
act.foo().then((something )=>{
    console.log("got result")
})
