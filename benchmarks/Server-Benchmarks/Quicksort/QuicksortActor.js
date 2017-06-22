Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var dataSize = null;
var maxVal = null;
var threshold = null;
var parentRef = null;
var position = null;
var data = [];
var result = [];
var numFragments = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(mData) {
    function config(hasParent, ds, mv, thresh, pos, parentPort) {
        if (hasParent) {
            parentRef = new benchUtils_1.ClientBufferSocket(parentPort, mHandle);
        }
        dataSize = ds;
        maxVal = mv;
        threshold = thresh;
        position = pos;
    }
    function newData(dataPoint) {
        data.push(dataPoint);
    }
    function configDone() {
        socketToMain.emit(["actorInit"]);
    }
    function sequentialSort(dataCopy) {
        var dataLength = dataCopy.length;
        if (dataLength < 2) {
            return dataCopy;
        }
        else {
            var pivot = dataCopy[dataLength / 2];
            var leftUnsorted = filterLessThan(dataCopy, pivot);
            var leftSorted = sequentialSort(leftUnsorted);
            var equalElements = filterEqualsTo(dataCopy, pivot);
            var rightUnsorted = filterGreaterThan(dataCopy, pivot);
            var rightSorted = sequentialSort(rightUnsorted);
            var sorted = [];
            for (var i in rightUnsorted) {
                sorted.push(rightUnsorted[i]);
            }
            for (var i in equalElements) {
                sorted.push(equalElements[i]);
            }
            for (var i in leftUnsorted) {
                sorted.push(leftUnsorted[i]);
            }
            return sorted;
        }
    }
    function notifyParentAndTerminate() {
        if (parentRef != null) {
            parentRef.emit(["gotResult", result, position]);
        }
        else {
            socketToMain.emit(["end"]);
        }
    }
    function filterLessThan(dataCopy, pivot) {
        var dataLength = dataCopy.length;
        var result = [];
        for (var i in dataCopy) {
            if (dataCopy[i] < pivot) {
                result.push(dataCopy[i]);
            }
        }
        return result;
    }
    function filterGreaterThan(dataCopy, pivot) {
        var dataLength = dataCopy.length;
        var result = [];
        for (var i in dataCopy) {
            if (dataCopy[i] > pivot) {
                result.push(dataCopy[i]);
            }
        }
        return result;
    }
    function filterEqualsTo(dataCopy, pivot) {
        var dataLength = dataCopy.length;
        var result = [];
        for (var i in dataCopy) {
            if (dataCopy[i] == pivot) {
                result.push(dataCopy[i]);
            }
        }
        return result;
    }
    function sort() {
        var dataLength = data.length;
        var dataLengthHalf = Math.floor(dataLengthHalf / 2);
        var pivot = data[dataLengthHalf];
        if (dataLength < threshold) {
            sequentialSort(data);
            notifyParentAndTerminate();
        }
        else {
            socketToMain.emit(["spawnNew", "LEFT", myPort]);
            socketToMain.emit(["spawnNew", "RIGHT", myPort]);
            result = filterEqualsTo(data, pivot);
            numFragments += 1;
        }
    }
    function childSpawned(position, refPort) {
        var ref = new benchUtils_1.ClientBufferSocket(refPort, mHandle);
        var dataLengthHalf = Math.floor(data.length / 2);
        var pivot = data[dataLengthHalf];
        var leftUnsorted = filterLessThan(data, pivot);
        var rightUnsorted = filterGreaterThan(data, pivot);
        if (position == "LEFT") {
            for (var i in leftUnsorted) {
                ref.emit(["newData", leftUnsorted[i]]);
            }
        }
        else {
            for (var i in rightUnsorted) {
                ref.emit(["newData", rightUnsorted[i]]);
            }
        }
        ref.emit(["configDone"]);
        ref.emit(["sort"]);
    }
    function gotResult(res, fromPosition) {
        if (!(data.length == 0)) {
            if (fromPosition == "LEFT") {
                var temp = [];
                for (var i in result) {
                    temp.push(result[i]);
                }
                for (var i in res) {
                    temp.push(res[i]);
                }
                result = temp;
            }
            else if (fromPosition == "RIGHT") {
                var temp = [];
                for (var i in res) {
                    temp.push(res[i]);
                }
                for (var i in result) {
                    temp.push(result[i]);
                }
                this.result = temp;
            }
        }
        numFragments += 1;
        if (numFragments == 3) {
            notifyParentAndTerminate();
        }
    }
    switch (mData[0]) {
        case "config":
            config(mData[1], mData[2], mData[3], mData[4], mData[5], mData[6]);
            break;
        case "newData":
            newData(mData[1]);
            break;
        case "configDone":
            configDone();
            break;
        case "sort":
            sort();
            break;
        case "childSpawned":
            childSpawned(mData[1], mData[2]);
            break;
        case "gotResult":
            gotResult(mData[1], mData[2]);
            break;
        default:
            console.log("Unknown message (Actor): " + mData[0]);
    }
}
//# sourceMappingURL=QuicksortActor.js.map