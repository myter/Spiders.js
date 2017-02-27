let spider = require('Spiders.js/src/spiders');
let clientManager = require('../Shared/ClientStore');

class CoCodeServerApplication extends spider.Application {

    constructor() {
        super();
        this.clientStore = new clientManager.ClientStore();
    }

    registerClient(newClientReference, newClientName) {
        console.log("adding client " + newClientName);

        newClientReference.refreshCoders(this.clientStore);
        this.clientStore.addClient(newClientName, newClientReference);

        let currentClientReferences = this.clientStore.getClientReferences();
        currentClientReferences.forEach(function (reference) {
            reference.addCoder(newClientName, newClientReference);
        });

        console.log("done adding clients");
    }

    receiveCodeCommit(rawCode) {
        console.log("server received code commit " + rawCode);
        let currentClientReferences = this.clientStore.getClientReferences();
        currentClientReferences.forEach(function (reference) {
            reference.updateCode(rawCode);
        });
    }
}

let cocodeServer = new CoCodeServerApplication();