import {SpiderLib} from "../../src/spiders";
import {PubSubLib} from "../../src/PubSub/PubSub";
/**
 * Created by flo on 03/04/2017.
 */
var spiders : SpiderLib = require("../../src/spiders")
var pubSub  : PubSubLib = require("../../src/PubSub/PubSub")

export class GroceryClient extends pubSub.PubSubClient{
    directory
    repMod
    groceryLists
    needed
    constructor(){
        super()
        this.directory = __dirname
    }

    init(){
        this.groceryLists   = new Map()
        this.repMod         = require(this.directory + "/GroceryListReps")
        var that            = this
        this.subscribe(this.repMod.GroceryTag).each((groceryList)=>{
            that.groceryLists[groceryList.name] = groceryList
            groceryList.items.onCommit((list)=>{
                //console.log("List updated")
                //console.log(list.asString())
                if(this.checkTermination(list)){
                    this.parent.clientDone()
                }
            })

            groceryList.totalItems.onCommit((ti)=>{
                //console.log("Total items: "+ ti)
            })
        })
    }

    newList(listName){
        let masterGrocery = this.newRepliq(this.repMod.GroceryRepliq,listName)
        this.publish(masterGrocery,this.repMod.GroceryTag)
    }

    //Both added for benchmarks, remove when comparing
    termination(items){
        this.needed = items.array
    }

    checkTermination(list){
        return this.needed.filter((item)=>{
            return list.has(item)
        }).length == this.needed.length
    }

    addItem(listName,itemName){
        this.groceryLists[listName].addGrocery(itemName)
    }

    incItem(listName,itemName){
        this.groceryLists[listName].incGrocery(itemName)
    }

    decItem(listName,itemName){
        this.groceryLists[listName].decGrocery(itemName)
    }

    remItem(listName,itemName){
        this.groceryLists[listName].removeGrocery(itemName)
    }
}


/*var server = new pubSub.PubSubServer()
var client1 = server.spawnActor(GroceryClient)
var client2 = server.spawnActor(GroceryClient)

client1.newList("TestList")
setTimeout(()=>{
    client1.addItem("TestList","Banana")
    setTimeout(()=>{
        client2.addItem("TestList","Pears")
    },2000)
},2000)*/



