/**
 * Created by sam on 07/02/2017.
 */

let spider = require('Spiders.js/src/spiders');

class ClientStore extends spider.Isolate {

    constructor() {
        super();

        this.names = [];
        this.references = [];
    }

    addClient(name, reference) {
        this[name] = reference;
        this.names.push(name);
        this.references.push(reference);
    }

    getClientReferences() {
        return this.references;
    }

    getClientNames() {
        return this.names;
    }
}

module.exports.ClientStore = ClientStore;