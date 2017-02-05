import {SpiderLib, FarRef} from "../src/spiders";
/**
 * Created by flo on 03/02/2017.
 */
var spiders : SpiderLib = require("../src/spiders")

class Player{
    ref     : FarRef
    name    : string
    constructor(ref,name){
        this.ref    = ref
        this.name   = name
    }
}
class SpiderPongServer extends spiders.Application{
    games       : Map<string,Player>
    occupation  : Map<string,number>
    clients     : Map<string,Player>

    constructor(){
        super()
        this.games      = new Map()
        this.clients    = new Map()
        this.occupation = new Map()
        console.log("Spider Pong Server Started")
    }

    newClient(nickName : string,ref : FarRef){
        console.log("Client connected: " + nickName)
        this.clients.set(nickName,new Player(ref,nickName))
        this.games.forEach((creator : Player,roomName : string)=>{
            ref.newGameCreated(roomName,creator.ref)
            if(this.occupation.get(roomName) > 1){
                ref.updateRoomInfo(roomName)
            }
        })

    }

    createNewGame(roomName : string,creatorRef : FarRef,creatorName){
        this.games.set(roomName,new Player(creatorRef,creatorName))
        this.occupation.set(roomName,1)
        this.clients.forEach((client : Player)=>{
            if(client.name != creatorName){
                client.ref.newGameCreated(roomName,creatorRef)
            }
        })
    }

    playerJoined(roomName : string,playerRef : FarRef,playerName : string){
        var otherPlayer : Player = this.games.get(roomName)
        this.occupation.set(roomName,this.occupation.get(roomName)+1)
        this.clients.forEach((client : Player)=>{
            if(client.name != playerName && client.name != otherPlayer.name){
                client.ref.updateRoomInfo(roomName)
            }
        })
    }
}
new SpiderPongServer()