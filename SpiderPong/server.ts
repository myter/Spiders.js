import {SpiderLib, FarRef} from "../src/spiders";
/**
 * Created by flo on 03/02/2017.
 */
var spiders : SpiderLib = require("../src/spiders")
class SpiderPongServer extends spiders.Application{
    games       : Map<string,FarRef>
    occupation  : Map<string,number>
    clients     : Map<string,FarRef>

    constructor(){
        super()
        this.games      = new Map()
        this.clients    = new Map()
        this.occupation = new Map()
    }

    init(){
        console.log("Spider Pong Server Started")
    }

    newClient(nickName : string,ref : FarRef){
        console.log("Client connected: " + nickName)
        this.clients.set(nickName,ref)
        this.games.forEach((creator,roomName)=>{
            ref.newGameCreated(roomName,creator)
            if(this.occupation.get(roomName) > 1){
                ref.updateRoomInfo(roomName)
            }
        })

    }

    createNewGame(roomName : string,creator : FarRef){
        console.log("New room created : " + roomName)
        this.games.set(roomName,creator)
        this.occupation.set(roomName,1)
        this.clients.forEach((client : FarRef)=>{
            if(client !== creator){
                client.newGameCreated(roomName,creator)
            }
        })
    }

    playerJoined(roomName : string,player : FarRef){
        var otherPlayer : FarRef = this.games.get(roomName)
        this.occupation.set(roomName,this.occupation.get(roomName)+1)
        this.clients.forEach((client : FarRef)=>{
            if(client !== player && client !== otherPlayer){
                client.updateRoomInfo(roomName)
            }
        })
    }
}
new SpiderPongServer()