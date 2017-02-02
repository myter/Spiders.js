import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Node extends spiders.Actor{
    nodeParent          = null
    root                = null
    height              = null
    id                  = null
    comp                = null
    urgent              = null
    binomial            = null
    children            = []
    hasGrantChildren    = []
    hasChildren         = false
    urgentChild         = null
    inTermination       = false

    config(nodeParent,root,height,id,comp,urgent,binomial) {
        this.nodeParent = nodeParent
        this.root = root
        this.height = height
        this.id = id
        this.comp = comp
        this.urgent = urgent
        this.binomial = binomial
    }

    loop(busywait,dummy) {
        var test = 0;
        for (var k = 0; k < dummy * busywait; k++) {
            test += 1;
        }
        return test;
    }

    tryGenerate() {
        this.loop(100, 40000)
        this.root.shouldGenerateChildren(this, this.height)
    }

    generateChildren(currentId,compSize) {
        var myArrayId = this.id % this.binomial
        this.nodeParent.updateGrant(myArrayId)
        var childrenHeight = this.height + 1
        var idValue = currentId
        var i = 0
        while (i < this.binomial) {
            this.parent.spawnNode(this, this.root, childrenHeight, idValue + i, compSize, false).then((ref)=> {
                this.children.push(ref)
                ref.tryGenerate()
                if (this.inTermination) {
                    ref.terminate()
                }
            })
            i += 1
        }
        this.hasChildren = true
    }

    generateUrgentChildren(urgentChildId, currentId, compSize) {
        var myArrayId = this.id % this.binomial
        this.nodeParent.updateGrant(myArrayId)
        var childrenHeight = this.height + 1
        var idValue = currentId
        this.urgentChild = urgentChildId
        var i = 0
        while (i < this.binomial) {
            this.parent.spawnNode(this, this.root, childrenHeight, idValue + i, compSize, i == urgentChildId).then((ref)=> {
                this.children.push(ref)
                ref.tryGenerate()
                if (this.inTermination) {
                    ref.terminate()
                }
            })
            i += 1
        }
        this.hasChildren = true
    }

    updateGrant(id) {
        this.hasGrantChildren[id] = true
    }

    traverse() {
        this.loop(this.comp, 40000)
        if (this.hasChildren) {
            this.children.forEach((child)=> {
                child.traverse()
            })
        }
    }

    terminate() {
        if (this.hasChildren) {
            this.children.forEach((child)=> {
                child.terminate()
            })
        }
        this.inTermination = true
        this.parent.endNode(this.id)
    }
}

class Root extends spiders.Actor{
    maxNodes            = null
    avgComp             = null
    stdComp             = null
    binomial            = null
    percent             = null
    height              = 1
    size                = 1
    children            = []
    hasGrantChildren    = []
    traversed           = false
    terminated          = false

    config(maxNodes,avgComp,stdComp,binomial,percent) {
        this.maxNodes = maxNodes
        this.avgComp = avgComp
        this.stdComp = stdComp
        this.binomial = binomial
        this.percent = percent
        this.parent.actorInit()
    }

    getNextNormal(avg,stdev) {
        var result = 0
        while (result <= 0) {
            var temp = Math.random() * ((100 - 0) + 0) * stdev + avg;
            result = Math.round(temp)
        }
        return result
    }

    generateTree() {
        this.height += 1
        var compSize = this.getNextNormal(this.avgComp, this.stdComp)
        var i = 0
        while (i < this.binomial) {
            this.hasGrantChildren[i] = false
            this.parent.spawnNode(this, this, this.height, this.size + 1, compSize, false).then((ref) => {
                this.children.push(ref)
                ref.tryGenerate()
            })
            i += 1
        }
        this.size += this.binomial
     }

    traverse() {
        this.children.forEach((child)=> {
            child.traverse()
        })
    }

    shouldGenerateChildren(childRef,childHeight) {
        if (this.size + this.binomial <= this.maxNodes) {
            var moreChildren = Math.floor(Math.random() * (2 - 0) + 0)
            if (moreChildren == 1) {
                var childComp = this.getNextNormal(this.avgComp, this.stdComp)
                var randomInt = Math.floor(Math.random() * (100 - 0) + 0)
                if (randomInt > this.percent) {
                    childRef.generateChildren(this.size, childComp)
                }
                else {
                    childRef.generateUrgentChildren(Math.round(Math.random() * (this.binomial - 0) + 0), this.size, childComp)
                }
                this.size += this.binomial
                if (childHeight + 1 > this.height) {
                    this.height += childHeight + 1
                }
            }
            else {
                if (childHeight > this.height) {
                    this.height = childHeight
                }
            }
        }
        else {
            if (!this.traversed) {
                this.traversed = true
                this.traverse()

            }
            this.terminate()
        }
    }

    updateGrant(id) {
        this.hasGrantChildren[id] = true
    }

    terminate() {
        if (!this.terminated) {
            this.children.forEach((child)=> {
                child.terminate()
            })
            this.parent.endNode("root")
            this.terminated = true
        }
    }
}

class UnbalancedCobwebbedTreeApp extends spiders.Application{
    actorsInitialised   = 0
    totalSpawned        = 1
    totalEnded          = 0
    rootRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        this.rootRef = this.spawnActor(Root)
        this.rootRef.config(BenchConfig.uctMaxNodes,BenchConfig.uctAvgCompSize,BenchConfig.uctStdevCompSize,BenchConfig.uctBinomial,BenchConfig.uctPercent)
    }

    checkConfig() {
        if (this.actorsInitialised == 1) {
            this.rootRef.generateTree()
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    spawnNode(par,root,height,id,comp,urgent) {
        var nodeRef = this.spawnActor(Node)
        nodeRef.config(par, root, height, id, comp, urgent, BenchConfig.uctBinomial)
        this.totalSpawned += 1
        return nodeRef
    }

    endNode(id) {
        this.totalEnded += 1
        if (this.totalEnded == this.totalSpawned) {
            this.end()
        }
    }

    end() {
        this.bench.stopPromise.resolve()
    }
}

export class SpiderUnbalancedCobwebbedTreeBench extends SpiderBenchmark{
    unbalancedCobwebbedTreeApp
    constructor(){
        super("Spiders.js Unbalanced Cobwebbed Tree","Spiders.js Unbalanced Cobwebbed Tree cycle completed","Spiders.js Unbalanced Cobwebbed Tree completed","Spiders.js Unbalanced Cobwebbed Tree scheduled")
    }

    runBenchmark(){
        this.unbalancedCobwebbedTreeApp = new UnbalancedCobwebbedTreeApp(this)
        this.unbalancedCobwebbedTreeApp.setup()
    }

    cleanUp(){
        this.unbalancedCobwebbedTreeApp.kill()
    }
}