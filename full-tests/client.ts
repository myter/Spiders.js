import {Application,Actor,SpiderIsolate,SpiderIsolateMirror,SpiderObject,SpiderObjectMirror,SpiderActorMirror,bundleScope,LexScope,FarRef} from "../src/spiders"

class ClientApp extends Application{
    log(testName,result,expected){
        var ul = document.getElementById("resultList");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(testName + ". Expected: " + expected + " . Result : " + result));
        li.setAttribute("id", "element4"); // added line
        if(result == expected){
            li.style.color = "Green";

        }
        else{
            li.style.color = "Red";
        }
        ul.appendChild(li);
    }

    logSucc(testName){
        var ul = document.getElementById("resultList");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(testName));
        li.setAttribute("id", "element4"); // added line
        li.style.color = "Green"
        ul.appendChild(li);
    }

    logFail(testName){
        var ul = document.getElementById("resultList");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(testName));
        li.setAttribute("id", "element4"); // added line
        li.style.color = "Red"
        ul.appendChild(li);
    }
}

class TestIsolate extends SpiderIsolate{
    value

    constructor(){
        super()
        this.value = 5
    }

    getValue(){
        return this.value
    }
}

class TestObject extends SpiderObject{
    value

    constructor(){
        super()
        this.value = 5
    }

    getValue(){
        return this.value
    }
}

class ClientActor extends Actor{
    serverRef : FarRef<any>
    myId
    TestIsolate
    TestObject

    constructor(myId){
        super()
        this.myId           = myId
        this.TestIsolate    = TestIsolate
        this.TestObject     = TestObject
    }

    init(){
        console.log(this.myId)
        this.libs.remote("127.0.0.1",8080).then((serverRef)=>{
            this.parent.logSucc("Connected to server via remote method")
            this.serverRef = serverRef
            serverRef.register(this).then((ok)=>{
                if(ok){
                    this.parent.logSucc("Registered with server")
                }
            }).catch(()=>{
                this.parent.logFail("Unable to register with server")
            })
        }).catch((e)=>{
            this.parent.logFail("Unable to connect to server: " + e.message)
        })
        setTimeout(()=>{
            if(!this.serverRef){
                this.parent.logFail("Unable to connect to server")
            }
        },2000)
    }

    meet(otherClient){
        otherClient.testPrimitiveRouting().then((v)=>{
            this.parent.log("Primitive Routing",v,"ok")
        })
        otherClient.testIsolateRouting().then((isol)=>{
            this.parent.log("Isolate Routing",isol.getValue(),5)
        })
        otherClient.testRefRouting().then((ref)=>{
            ref.getValue().then((v)=>{
                this.parent.log("Ref Routing",v,5)
            })
        })
    }

    testPrimitiveRouting(){
        return "ok"
    }

    testIsolateRouting(){
        return new this.TestIsolate()
    }

    testRefRouting(){
        return new this.TestObject()
    }
}

var app = new ClientApp()
app.spawnActor(ClientActor,[(window as any).thisId])