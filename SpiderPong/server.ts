/**
 * Created by flo on 03/02/2017.
 */

import {Application, FarRef, SpiderIsolate} from "../src/spiders";
import {SpiderPongClient} from "./public/js/logic"


class Player{
    ref     : FarRef<SpiderPongClient>
    name    : string
    constructor(ref,name){
        this.ref    = ref
        this.name   = name
    }
}
export class SpiderPongServer extends Application{
    games       : Map<string,Player>
    occupation  : Map<string,number>
    clients     : Map<string,Player>

    constructor(){
        super()
        this.games      = new Map()
        this.clients    = new Map()
        this.occupation = new Map()
        console.log("Starting SpiderPong server")
        let resourceOptions                     = {
            publicResourceURL :'/public',
            pathToPublicResource : './public'
        }
        this.libs.serveApp("./index.html","./public/js/logic.js",8888,resourceOptions).then(()=>{
            console.log("Server running on port 8888")
        })
    }

    newClient(nickName : string,ref : FarRef<SpiderPongClient>){
        this.clients.set(nickName,new Player(ref,nickName))
        this.games.forEach((creator : Player,roomName : string)=>{
            ref.newGameCreated(roomName,creator.ref)
            if(this.occupation.get(roomName) > 1){
                ref.updateRoomInfo(roomName)
            }
        })

    }

    createNewGame(roomName : string,creatorRef : FarRef<SpiderPongClient>,creatorName){
        this.games.set(roomName,new Player(creatorRef,creatorName))
        this.occupation.set(roomName,1)
        this.clients.forEach((client : Player)=>{
            if(client.name != creatorName){
                client.ref.newGameCreated(roomName,creatorRef)
            }
        })
    }

    playerJoined(roomName : string,playerRef : FarRef<SpiderPongClient>,playerName : string){
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