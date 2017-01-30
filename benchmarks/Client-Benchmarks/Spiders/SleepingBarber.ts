import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Customer extends spiders.Actor{
    factoryRef

    config(factoryRef){
        this.factoryRef = factoryRef
        this.parent.actorInit()
    }

    roomFull() {
        this.factoryRef.back(this)
    }

    done() {
        this.factoryRef.done()
    }
}

class CustomerFactory extends spiders.Actor{
    totalHaircuts       = 0
    productionRate      = 0
    currentHaircuts     = 0
    roomRef             = null
    customers           = []

    config(roomRef,totalHaircuts,productionRate) {
        this.totalHaircuts  = totalHaircuts
        this.productionRate = productionRate
        this.roomRef        = roomRef
    }

    newCustomer(customerRef) {
        this.customers.push(customerRef)
        if (this.customers.length == this.totalHaircuts) {
            this.parent.actorInit()
        }
    }

    busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }

    start() {
        this.customers.forEach((customer) => {
            this.roomRef.customerEnter(customer)
            this.busyWait(this.productionRate)
        })
    }

    back(customer) {
        this.roomRef.customerEnter(customer)
    }

    done() {
        this.currentHaircuts += 1
        if (this.currentHaircuts == this.totalHaircuts) {
            this.parent.end()
        }
    }
}

class Barber extends spiders.Actor{
    haircutRate = null

    config(haircutRate) {
        this.haircutRate = haircutRate
        this.parent.actorInit()
    }

    busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }

    newCustomer(customer,room) {
        this.busyWait(this.haircutRate)
        customer.done()
        room.nextCustomer()
    }
}

class WaitingRoom extends spiders.Actor{
    capacity    = 0
    waiting     = []
    barberRef   = null
    barberSleep = true

    config(barberRef,capacity) {
        this.capacity = capacity
        this.barberRef = barberRef
        this.parent.actorInit()
    }

    customerEnter(customerRef) {
        if (this.waiting.length == this.capacity) {
            customerRef.roomFull()
        }
        else {
            this.waiting.push(customerRef)
            if (this.barberSleep) {
                this.barberSleep = false
                this.nextCustomer()
            }
        }
    }

    nextCustomer() {
        if (this.waiting.length > 0) {
            var customer = this.waiting.pop()
            this.barberRef.newCustomer(customer, this)
        }
        else {
            this.barberSleep = true
        }
    }
}

class SleepingBarberApp extends spiders.Application{
    actorsInitialised   = 0
    customers           = []
    customerFactoryRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        var barberRef 			    = this.spawnActor(Barber)
        barberRef.config(BenchConfig.barberHaircut)
        var waitingRoomRef 		    = this.spawnActor(WaitingRoom)
        waitingRoomRef.config(barberRef,BenchConfig.barberWaitingRoom)
        this.customerFactoryRef 	= this.spawnActor(CustomerFactory)
        this.customerFactoryRef.config(waitingRoomRef,BenchConfig.barberNrHaircuts,BenchConfig.barberProduction)
        var custCount 			    = BenchConfig.barberNrHaircuts - 1
        while(custCount >= 0){
            var newCust = this.spawnActor(Customer)
            newCust.config(this.customerFactoryRef)
            this.customerFactoryRef.newCustomer(newCust)
            this.customers.push(newCust)
            custCount -= 1
        }
    }

    checkConfig() {
        if (this.actorsInitialised == BenchConfig.barberNrHaircuts + 3) {
            this.customerFactoryRef.start()
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    end() {
        this.bench.stopPromise.resolve()
    }
}

export class SpiderSleepingBarberBench extends SpiderBenchmark{
    sleepingBarberApp
    constructor(){
        super("Spiders.js Sleeping Barber","Spiders.js Sleeping Barber cycle completed","Spiders.js Sleeping Barber completed","Spiders.js Sleeping Barber scheduled")
    }

    runBenchmark(){
        this.sleepingBarberApp = new SleepingBarberApp(this)
        this.sleepingBarberApp.setup()
    }

    cleanUp(){
        this.sleepingBarberApp.kill()
        this.sleepingBarberApp.customers = []
    }
}