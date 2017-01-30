/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var parent = null;
    var root = null;
    var height = null;
    var id = null;
    var comp = null;
    var urgent = null;
    var binomial = null;
    var children = [];
    var hasGrantChildren = [];
    var hasChildren = false;
    var urgentChild = null;
    var inTermination = false;
    var partId = Math.random();
    function mHandle(event) {
        function config(rootRef, h, i, c, u, b) {
            root = rootRef;
            root.onmessage = mHandle;
            height = h;
            id = i;
            comp = c;
            urgent = u;
            binomial = b;
        }
        function linkParent(ref) {
            parent = ref;
            parent.onmessage = mHandle;
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        function loop(busywait, dummy) {
            var test = 0;
            for (var k = 0; k < dummy * busywait; k++) {
                test += 1;
            }
            return test;
        }
        function tryGenerate() {
            loop(1000, 100000);
            var c = new MessageChannel();
            c.port2.onmessage = mHandle;
            root.postMessage(["shouldGenerateChildren", height], [c.port1]);
        }
        function generateChildren(currentId, compSize) {
            var myArrayId = id % binomial;
            parent.postMessage(["updateGrant", myArrayId]);
            var childrenHeight = height + 1;
            var idValue = currentId;
            var i = 0;
            while (i < binomial) {
                var rootCop = new MessageChannel();
                root.postMessage(["link"], [rootCop.port2]);
                self.postMessage(["spawnNodeP1", childrenHeight, idValue + 1, compSize, false, partId], [rootCop.port1]);
                var c2 = new MessageChannel();
                c2.port2.onmessage = mHandle;
                self.postMessage(["spawnNodeP2", partId], [c2.port1]);
                partId += 1;
                i += 1;
            }
            hasChildren = true;
        }
        function generateUrgentChildren(urgentChildId, currentId, compSize) {
            var myArrayId = id % binomial;
            parent.postMessage(["updateGrant", myArrayId]);
            var childrenHeight = height + 1;
            var idValue = currentId;
            urgentChild = urgentChildId;
            var i = 0;
            while (i < binomial) {
                var rootCop = new MessageChannel();
                root.postMessage(["link"], [rootCop.port2]);
                self.postMessage(["spawnNodeP1", childrenHeight, idValue + 1, compSize, i == urgentChildId, partId], [rootCop.port1]);
                var c2 = new MessageChannel();
                c2.port2.onmessage = mHandle;
                self.postMessage(["spawnNodeP2", partId], [c2.port1]);
                partId += 1;
                i += 1;
            }
            hasChildren = true;
        }
        function childSpawned(childRef) {
            children.push(childRef);
            childRef.postMessage(["tryGenerate"]);
            if (inTermination) {
                childRef.postMessage(["terminate"]);
            }
        }
        function updateGrant(id) {
            hasGrantChildren[id] = true;
        }
        function traverse() {
            loop(comp, 40000);
            if (hasChildren) {
                for (var i in children) {
                    children[i].postMessage(["traverse"]);
                }
            }
        }
        function terminate() {
            if (hasChildren) {
                for (var i in children) {
                    children[i].postMessage(["terminate"]);
                }
            }
            inTermination = true;
            self.postMessage(["endNode", id]);
        }
        switch (event.data[0]) {
            case "config":
                config(event.ports[0], event.data[1], event.data[2], event.data[3], event.data[4], event.data[5]);
                break;
            case "linkParent":
                linkParent(event.ports[0]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            case "tryGenerate":
                tryGenerate();
                break;
            case "generateChildren":
                generateChildren(event.data[1], event.data[2]);
                break;
            case "generateUrgentChildren":
                generateUrgentChildren(event.data[1], event.data[2], event.data[3]);
                break;
            case "childSpawned":
                childSpawned(event.ports[0]);
                break;
            case "updateGrant":
                updateGrant(event.data[1]);
                break;
            case "traverse":
                traverse();
                break;
            case "terminate":
                terminate();
                break;
            default:
                console.log("Unknown message (Node): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=UnbalancedCobwebbedTreeNode.js.map