Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var meetingsHeld = 0;
var color = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
function mHandler(data) {
    function config(cr) {
        color = cr;
        socketToMain.emit(["actorInit"]);
    }
    function startGame() {
        socketToMain.emit(["meet", color, myPort]);
    }
    function exitGame() {
        color = -1;
        socketToMain.emit(["meetCount", meetingsHeld]);
    }
    function meet(otherColor, otherPort) {
        color = complement(otherColor);
        meetingsHeld += 1;
        var otherActor = new benchUtils_1.ClientBufferSocket(otherPort, mHandler);
        otherActor.emit(["changeColor", color]);
        socketToMain.emit(["meet", color, myPort]);
    }
    function changeColor(color) {
        color = color;
        meetingsHeld += 1;
        socketToMain.emit(["meet", color, myPort]);
    }
    function complement(otherColor) {
        switch (color) {
            case -1: return -1;
            case 0:
                switch (otherColor) {
                    case 1: return 2;
                    case 2: return 1;
                    case 0: return 0;
                    case -1: return -1;
                }
                ;
            case 1:
                switch (otherColor) {
                    case 1: return 1;
                    case 2: return 0;
                    case 0: return 2;
                    case -1: return -1;
                }
            case 2:
                switch (otherColor) {
                    case 1: return 0;
                    case 2: return 2;
                    case 0: return 1;
                    case -1: return -1;
                }
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "startGame":
            startGame();
            break;
        case "exitGame":
            exitGame();
            break;
        case "meet":
            meet(data[1], data[2]);
            break;
        case "changeColor":
            changeColor(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=ChameneoActor.js.map