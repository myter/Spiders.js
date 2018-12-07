import {Application, FarRef} from "../src/spiders";
import {Server} from "./server";

export class SimpleClient extends Application {
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

    constructor(){
        super()
        let server : FarRef<Server> = this.libs.buffRemote("127.0.0.1",8000);
        let connectionOk            = false;
        (server.handShake() as any).then(()=>{
            connectionOk = true
            this.handshakePerformed()

        })
        setTimeout(()=>{
            if(!connectionOk){
                this.logFail("Handshake with server")
            }
        },1000)
    }

    handshakePerformed(){
        this.logSucc("Handshake with server")
    }
}

export class GlobalVarclient extends SimpleClient{

    handshakePerformed(){
        super.handshakePerformed()
        console.log((window as any).foo)
    }

}