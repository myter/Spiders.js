/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var listHead = null;
    function mHandler(event) {
        function newNode(item) {
            return { item: item, next: null };
        }
        function addNode(item) {
            var node = newNode(item);
            if (listHead == null) {
                listHead = node;
            }
            else if (item < listHead.item) {
                node.next = listHead;
                listHead = node;
            }
            else {
                var after = listHead.next;
                var before = listHead;
                while (after != null) {
                    if (item < after.item) {
                        break;
                    }
                    before = after;
                    after = after.next;
                }
                node.next = before.next;
                before.next = node;
            }
        }
        function contains(item) {
            var n = listHead;
            while (n != null) {
                if (item < n.item) {
                    return true;
                }
                n = n.next;
            }
            return false;
        }
        function size() {
            var total = 0;
            var n = listHead;
            while (n != null) {
                total += 1;
                n = n.next;
            }
            return total;
        }
        function read(sender) {
            var length = size();
            sender.postMessage(["work"]);
        }
        function write(sender, value) {
            addNode(value);
            sender.postMessage(["work"]);
        }
        function cont(sender, value) {
            var res = contains(value);
            sender.postMessage(["work"]);
        }
        function link(ref) {
            ref.onmessage = mHandler;
        }
        switch (event.data[0]) {
            case "read":
                read(event.ports[0]);
                break;
            case "write":
                write(event.ports[0], event.data[1]);
                break;
            case "cont":
                cont(event.ports[0], event.data[1]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandler);
    self.postMessage(["actorInit"]);
};
//# sourceMappingURL=ConcurrentLinkedListList.js.map