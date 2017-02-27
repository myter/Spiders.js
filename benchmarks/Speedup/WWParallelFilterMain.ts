import {SpiderBenchmark, BenchConfig} from "../benchUtils";
/**
 * Created by flo on 18/02/2017.
 */

export class WWParallelFilterBench extends SpiderBenchmark{
    workers
    constructor(){
        super("Web Worker Parallel Filter","Web Worker Parallel Filter cycle completed","Web Worker Parallel Filter completed","Web Worker Parallel Filter scheduled")
        this.workers = []
    }

    randomKernel(kernel) {
        for(var i in kernel) {
            for (var j in kernel[0]) {
                kernel[i][j] = Math.random();
            }
        }
        return kernel;
    }

    runBenchmark(){
        var resultsReceived = 0
        var that            = this
        //The only even received is the "result" event
        function messageHandler(event){
            resultsReceived += 1
            if(resultsReceived == BenchConfig.filterImageWorkers){
                that.stopPromise.resolve()
            }
        }
        var work = require('webworkify')
        var imageData = BenchConfig.makeFilterImage()
        var kernel   = this.randomKernel(BenchConfig.filterBaseKernal)
        var totalWidth = imageData.width
        var totalHeight = imageData.height
        var totalPixels  = imageData.data
        var widthPerWorker = Math.ceil(totalWidth / BenchConfig.filterImageWorkers)
        //var heightPerWorker = Math.ceil(totalHeight / BenchConfig.filterImageWorkers)
        var pixelsPerWorker = Math.ceil(totalPixels.length / BenchConfig.filterImageWorkers)
       // console.log("Pixels per worker : " + pixelsPerWorker + " width " + widthPerWorker + " height " + heightPerWorker)
        for(var i = 0;i < BenchConfig.filterImageWorkers;i++){
            let act = work(require('./WWParallelFilterWorker'))
            act.addEventListener('message',messageHandler)
            that.workers.push(act)
            var stop = pixelsPerWorker
            if(stop > totalPixels.length){
                stop = totalPixels.length
            }
            var actData = (totalPixels as any).splice(0,stop)
            act.postMessage([kernel,actData,widthPerWorker,totalHeight])
        }
    }

    cleanUp(){
        this.cleanWorkers(this.workers)
        this.workers = []
    }
}