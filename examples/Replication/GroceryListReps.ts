import {SpiderLib} from "../../src/spiders";
import {PubSubLib} from "../../src/PubSub/PubSub";
import {ObjectFieldUpdate} from "../../src/Replication/RepliqObjectField";
/**
 * Created by flo on 03/04/2017.
 */
var spiders : SpiderLib = require("../../src/spiders")
var pubSub  : PubSubLib = require("../../src/PubSub/PubSub")

export var GroceryTag = new pubSub.PubSubTag("Grocery")

class KV{
    put(key,val){
        Reflect.set(this,key,val)
    }

    remove(key){
        Reflect.deleteProperty(this,key)
    }

    get(key){
        return Reflect.get(this,key)
    }

    has(key){
        return Reflect.has(this,key)
    }

    //Added for debug, remove when comparing
    asString(){
        let ret = ""
        Reflect.ownKeys(this).forEach((key)=>{
            let name        = key.toString()
            let quantity    = Reflect.get(this,key)
            ret = ret  + name + ": " + quantity + "\n"
        })
        return ret
    }
}

class GroceryField extends spiders.RepliqObjectField{
    update(updates){
        var that = this
        function canUpdate(update : ObjectFieldUpdate){
            if(update.methodName == "put"){
                if(update.args[2] > 1){
                    return (that.tentative as any).has(update.args[0])
                }
                else {
                    return !(that.tentative as any).has(update.args[0])
                }
            }
            else if(update.methodName == "delete"){
                return (that.tentative as any).has(update.args[0])
            }
            else{
                return true
            }
        }
        updates.forEach((update : ObjectFieldUpdate)=>{
            if(canUpdate(update)){
                this.tentative[update.methodName](...update.args)
            }
        })
    }
}
var grocery = spiders.makeAnnotation(GroceryField)

export class GroceryRepliq extends spiders.Repliq{
    name

    @grocery
    items

    @spiders.Count
    totalItems

    constructor(name){
        super()
        this.name           = name
        this.items          = new KV()
        this.totalItems     = 0
    }

    @spiders.atomic
    addGrocery(name){
        this.items.put(name,1)
        this.totalItems = this.totalItems.read() + 1
    }

    @spiders.atomic
    removeGrocery(name){
        let quantity = this.items.get(name)
        this.items.delete(name)
        this.totalItems = this.totalItems.read() - quantity
    }

    incGrocery(name){
        let quantity = this.items.get(name)
        this.items.put(name,quantity + 1)
    }

    decGrocery(name){
        let quantity = this.items.get(name)
        this.items.decItem(name,quantity - 1)
    }
}