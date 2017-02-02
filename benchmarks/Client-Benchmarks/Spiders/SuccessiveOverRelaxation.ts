import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 01/02/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Peer extends spiders.Actor{
    omega               = null
    jacobi              = null
    s                   = null
    partStart           = null
    matrixPart          = null
    border              = null
    sorSource           = null
    gTotal              = 0.0
    returned            = 0
    totalMsgRcv         = 0
    expectingBoot       = true
    sorActors           = []
    sorActorsSpawned    = 0
    sorActorsRec        = 0
    myBorder            = null

    config(omega,jacobi,s,partStart,matrix,sorSource) {
        this.omega = omega
        this.jacobi = jacobi
        this.s = s
        this.partStart = partStart
        this.matrixPart = matrix
        this.border = []
        this.sorSource = sorSource
    }

    addBorder(borderElement,pos) {
        this.border[pos] = borderElement
    }

    boot() {
        this.expectingBoot = false
        this.myBorder = []
        for (var i = 0; i < this.s; i++) {
            this.sorActors[i * (this.s - this.partStart + 1)] = this.border[i]
        }
        var that = this

        function outerLoop(i) {
            if (i < that.s) {
                var c = (i + that.partStart) % 2

                function innerLoop(j) {
                    if (j < (that.s - that.partStart + 1)) {
                        var pos = i * (that.s - that.partStart + 1) + j
                        c = 1 - c
                        that.sorActorsSpawned += 1
                        that.parent.spawnSorActor(pos, that.matrixPart[i][j - 1], c, that.s, that.s - that.partStart + 1, that.omega, that, true).then((ref)=>{
                            //console.log("Added originally at position: " + pos)
                            that.sorActors[pos] = ref
                            that.sorActorsRec += 1
                            if (j == 1) {
                                that.myBorder[i] = ref
                            }
                        })
                        innerLoop(j + 1)
                    }
                }

                innerLoop(1)
                outerLoop(i + 1)
            }
        }

        outerLoop(0)
        this.kickStart()
    }

    kickStart() {
        var sorActors   = this.sorActors
        var s           = this.s
        var partStart   = this.partStart
        var myBorder    = this.myBorder
        if (this.sorActorsSpawned == this.sorActorsRec) {
            for (var i = 0; i < s; i++) {
                for (var j = 1; j < (s - partStart + 1); j++) {
                    var pos = i * (s - partStart + 1) + j
                    sorActors.forEach((sorAct,z)=>{
                        if (sorAct != null) {
                            sorActors[pos].addMActor(sorAct, z)
                        }
                    })
                    sorActors[pos].start(this.jacobi)
                }
            }
            myBorder.forEach((border,k)=>{
                if (border != null) {
                    this.sorSource.addBorder(border, k)
                }
            })
            this.sorSource.borderMessage()
        }
        else {
            var that = this
            setTimeout(function () {
                that.kickStart()
            }, 200)
        }
    }

    resultMessage(mx, my, mv, msgRcv) {
        this.totalMsgRcv += msgRcv
        this.returned += 1
        this.gTotal += mv
        if (this.returned == this.s * (this.s - this.partStart)) {
            this.sorSource.resultMessage(-1, -1, this.gTotal, this.totalMsgRcv)
            this.parent.actorExit()
        }
    }
}


class SorActor extends spiders.Actor{
    pos                 = null
    value               = null
    color               = null
    nx                  = null
    ny                  = null
    omega               = null
    sorSource           = null
    peer                = null
    //
    x                   = null
    y                   = null
    omega_over_four     = null
    one_minus_omega     = null
    neighbors           = []
    iter                = 0
    maxIter             = 0
    msgRcv              = 0
    sorActors           = []
    mActors             = []
    receivedVals        = 0
    sum                 = 0.0
    expectingStart      = true
    pendingMessages     = []

    calPos(x1,y1) {
        return x1 * this.ny + y1
    }

    calcNeighbors() {
        var result = []
        if (this.x > 0 && this.x < this.nx - 1 && this.y > 0 && this.y < this.ny - 1) {
            result[0] = this.calPos(this.x, this.y + 1)
            result[1] = this.calPos(this.x + 1, this.y)
            result[2] = this.calPos(this.x, this.y - 1)
            result[3] = this.calPos(this.x - 1, this.y)
        }
        else if ((this.x == 0 || this.x == (this.nx - 1)) && (this.y == 0 || this.y == (this.ny - 1))) {
            if (this.x == 0) {
                result[0] = this.calPos(this.x + 1, this.y)
            }
            else {
                result[0] = this.calPos(this.x - 1, this.y)
            }
            if (this.y == 0) {
                result[1] = this.calPos(this.x, this.y + 1)
            }
            else {
                result[1] = this.calPos(this.x, this.y - 1)
            }
        }
        else if ((this.x == 0 || this.x == (this.nx - 1)) || (this.y == 0 || this.y == (this.ny - 1))) {
            if (this.x == 0 || this.x == this.nx - 1) {
                if (this.x == 0) {
                    result[0] = this.calPos(this.x + 1, this.y)
                }
                else {
                    result[0] = this.calPos(this.x - 1, this.y)
                }
                result[1] = this.calPos(this.x, this.y + 1)
                result[2] = this.calPos(this.x, this.y - 1)
            }
            else {
                if (this.y == 0) {
                    result[0] = this.calPos(this.x, this.y + 1)
                }
                else {
                    result[0] = this.calPos(this.x, this.y - 1)
                }
                result[1] = this.calPos(this.x + 1, this.y)
                result[2] = this.calPos(this.x - 1, this.y)
            }

        }
        return result
    }

    config(pos,value,color,nx,ny,omega,sorSource,peer) {
        this.pos = pos
        this.value = value
        this.color = color
        this.nx = nx
        this.ny = ny
        this.omega = omega
        this.sorSource = sorSource
        this.peer = peer
        //
        this.x = Math.floor(pos / ny)
        this.y = pos % ny
        this.omega_over_four = 0.25 * omega
        this.one_minus_omega = 1.0 - omega
        this.neighbors = this.calcNeighbors()
    }

    addMActor(mActor,pos) {
        //console.log("added actor at position: " + pos)
        this.mActors[pos] = mActor
        //this.mActors.push(mActor)
    }

    start(mi) {
        this.expectingStart = false
        this.sorActors = this.mActors
        this.maxIter = mi
        var neighbours = this.neighbors
        if (this.color == 1) {
            neighbours.forEach((neigh)=>{
                this.sorActors[neigh].valueMessage(this.value)
            })
            this.iter += 1
            this.msgRcv += 1
        }
        this.pendingMessages.forEach((msg)=>{
            msg()
        })
        this.pendingMessages = []
        this.mActors = []
    }

    valueMessage(val) {
        if (this.expectingStart) {
            var that = this
            this.pendingMessages.push(function () {
                that.valueMessage(val)
            })
        }
        else {
            this.msgRcv += 1
            if (this.iter < this.maxIter) {
                this.receivedVals += 1
                this.sum += val
                //console.log("Received vals: " + this.receivedVals + " length: " + this.neighbors.length)
                if (this.receivedVals == this.neighbors.length) {
                    this.value = (this.omega_over_four * this.sum ) + (this.one_minus_omega * this.value)
                    this.sum = 0.0
                    this.receivedVals = 0
                    this.neighbors.forEach((neigh)=>{
                        this.sorActors[neigh].valueMessage(this.value)
                    })
                    this.iter += 1
                }
                if (this.iter == this.maxIter) {
                    this.sorSource.resultMessage(this.x, this.y, this.value, this.msgRcv)
                    this.parent.actorExit()
                }
            }
        }
    }
}

class Runner extends spiders.Actor{
    n                   = null
    s                   = null
    omega               = null
    jacobi              = null
    part                = null
    sorActors           = []
    gTotal              = 0.0
    returned            = 0
    totalMsgRcv         = 0
    expectingBoot       = true
    sorActorsSpawned    = 0
    sorActorsRec        = 0
    mBorder             = []
    myBorder            = []

    config(n,s,omega,jacobi) {
        this.n = n
        this.s = s
        this.omega = omega
        this.jacobi = jacobi
        this.part = Math.floor(s / 2)
        this.parent.actorInit()
    }

    genRandomMatrix(M,N) {
        var A = []
        for (var i = 0; i < M; i++) {
            A[i] = []
            for (var j = 0; j < N; j++) {
                A[i][j] = (Math.random() * (100 - 0) + 0) * 1e-6
            }
        }
        return A
    }

    boot() {
        this.myBorder = []
        var randoms = this.genRandomMatrix(this.s, this.s)
        var that = this
        function outerLoop(i) {
            if (i < that.s) {
                var c = i % 2
                function innerLoop(j) {
                    if (j < that.part) {
                        var pos = i * (that.part + 1) + j
                        c = 1 - c
                        that.sorActorsSpawned += 1
                        that.parent.spawnSorActor(pos, randoms[i][j], c, that.s, that.part + 1, that.omega, that, false).then((ref)=>{
                            that.sorActors[pos] = ref
                            that.sorActorsRec += 1
                            if (j == (that.part - 1)) {
                                that.myBorder[i] = ref
                            }
                        })
                        innerLoop(j + 1)
                    }
                }

                innerLoop(0)
                outerLoop(i + 1)
            }
        }
        outerLoop(0)
        var partialMatrix = []
        for (var i = 0; i < this.s; i++) {
            partialMatrix[i] = []
            for (var j = 0; j < this.s - this.part; j++) {
                partialMatrix[i][j] = randoms[i][j + this.part]
            }
        }
        //TODO not needed anymore ?
        //var isolMatrix = this.isolate(partialMatrix)
        var that = this
        function waitForBorder() {
            if (that.sorActorsSpawned == that.sorActorsRec) {
                that.parent.spawnSorPeer(that.s, that.part, partialMatrix, that).then((ref)=>{
                    that.myBorder.forEach((bor,i)=>{
                        if (bor != null) {
                            ref.addBorder(bor, i)
                        }
                    })
                    ref.boot()
                })
            }
            else {
                setTimeout(function () {
                    waitForBorder()
                }, 200)
            }
        }

        waitForBorder()
    }

    addBorder(border,pos) {
        this.mBorder[pos] = border
    }

    borderMessage() {
        var sorActors = this.sorActors
        if (this.sorActorsSpawned == this.sorActorsRec) {
            for (var i = 0; i < this.s; i++) {
                sorActors[(i + 1) * (this.part + 1) - 1] = this.mBorder[i]
            }
            for (var i = 0; i < this.s; i++) {
                for (var j = 0; j < this.part; j++) {
                    var pos = i * (this.part + 1) + j
                    sorActors.forEach((sorAct,z)=>{
                        if (sorAct != null) {
                            sorActors[pos].addMActor(sorAct, z)
                        }
                    })
                    sorActors[pos].start(this.jacobi)
                }
            }
            this.sorActors = sorActors
        }
        else {
            var that = this
            setTimeout(function () {
                that.borderMessage()
            }, 200)
        }
    }

    resultMessage(mx, my, mv, msgRcv) {
        this.totalMsgRcv += msgRcv
        this.returned += 1
        this.gTotal += mv
        if (this.returned == (this.s * this.part) + 1) {
            this.parent.actorExit()
        }
    }
}

class SuccessiveOverRelaxationApp extends spiders.Application{
    actorsInitialised   = 0
    actorsExited        = 0
    totalSpawned        = 1
    runnerRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        this.runnerRef = this.spawnActor(Runner)
        this.runnerRef.config(BenchConfig.sorN,BenchConfig.sorDataSizes[BenchConfig.sorN],BenchConfig.sorOmega,BenchConfig.sorJacobi)
    }

    checkConfig() {
        if (this.actorsInitialised == 1) {
            this.runnerRef.boot()
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    actorExit() {
        this.actorsExited += 1
        if (this.actorsExited == this.totalSpawned) {
            this.bench.stopPromise.resolve()
        }
    }


    spawnSorActor(pos,value,color,nx,ny,omega,sorSource,peer) {
        var actRef = this.spawnActor(SorActor)
        actRef.config(pos, value, color, nx, ny, omega, sorSource, peer)
        this.totalSpawned += 1
        return actRef
    }

    spawnSorPeer(s,partStart,matrix,sorSource) {
        var peerRef = this.spawnActor(Peer)
        peerRef.config(BenchConfig.sorOmega, BenchConfig.sorJacobi, s, partStart, matrix, sorSource)
        this.totalSpawned += 1
        return peerRef
    }
}

export class SpiderSuccessiveOverRelaxationBench extends SpiderBenchmark{
    successiveOverRelaxationApp
    constructor(){
        super("Spiders.js Successive Over Relaxation","Spiders.js Successive Over Relaxation cycle completed","Spiders.js Successive Over Relaxation completed","Spiders.js Successive Over Relaxation scheduled")
    }

    runBenchmark(){
        this.successiveOverRelaxationApp = new SuccessiveOverRelaxationApp(this)
        this.successiveOverRelaxationApp.setup()
    }

    cleanUp(){
        this.successiveOverRelaxationApp.kill()
    }
}