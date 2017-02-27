let spider = require('spiders.js/src/spiders');
let clientManager = require('../Shared/ClientStore');

let commitButton = document.getElementById("CodeCommitButton");
let codeField = document.getElementById("codeField");

let publicChatSendButton = document.getElementById("publicSendButton");
let publicChatInputField = document.getElementById("publicMessageText");
let publicChatArea = document.getElementById("publicChat");


let privateChatCoderMenu = document.getElementById("codersMenu");
let privateChatSendButton = document.getElementById("privateSendButton");
let privateChatInputField = document.getElementById("privateMessageText");



class CoCodeClientApplication extends spider.Application {

    initialize(name, server, codeHighlighter) {
        this.name = name;

        this.coders = new clientManager.ClientStore();


        let actorThis = this;
        $(commitButton).click(function () {
            let rawCode = codeField.innerText;
            server.receiveCodeCommit(rawCode);
        });

        $(publicChatSendButton).click(function () {
            let message = name + ": " + publicChatInputField.value;
            let clientReferences = actorThis.coders.getClientReferences();
            clientReferences.forEach(function (reference) {

                reference.addChatMessage(message)
            });
            actorThis.addChatMessage(message);
            publicChatInputField.value = "";
        });

        $(privateChatSendButton).click(function () {
            let selectedPeer = privateChatCoderMenu.options[privateChatCoderMenu.selectedIndex].value;
            let message = name + ": " + privateChatInputField.value;
            actorThis.sendPrivateMessage(selectedPeer, message);
            privateChatInputField.value = "";
        });

        this.highlightService = codeHighlighter;
    }

    refreshCoders(coders) {
        console.log("Refreshing coders");

        let names = coders.getClientNames();
        let references = coders.getClientReferences();

        names.forEach((name, idx) => this.addCoder(name, references[idx]));
    }

    addCoder(name, coderReference) {
        if (this.name !== name) {
            this.coders.addClient(name, coderReference);
            privateChatCoderMenu.innerHTML += "<option value='" + name + "'>" + name + "</option>";
        }
    }

    addChatMessage(message) {
        publicChatArea.value += message;
        publicChatArea.value += "\n";
    }

    sendPrivateMessage(receiverName, message) {
        let peer = this.coders[receiverName];
        peer.receivePrivateMessage(message);
    }


    receivePrivateMessage(message) {
        alert(message);
    }

    updateCode(rawCode) {
        console.log("updating code: " + rawCode);
        this.highlightService.highlightCode(rawCode).then(function(html) {
            codeField.innerHTML = html;
        });
    }
}


class CodeHighlighter extends spider.Actor {
    init() {
        importScripts("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.9.0/highlight.min.js");
    }

    highlightCode(rawCode) {
        let highlighted = self.hljs.highlightAuto(rawCode);
        return highlighted.value;
    }
}

$("#loginForm").submit(function (e) {
    // prevent submit event propagation
    e.preventDefault();

    startApplication($("#coderNameField").val());
});

function startApplication(name) {
    $('#loginArea').hide();
    $('#codeArea').show();
    $('#chatArea').show();

    let cocodeClient = new CoCodeClientApplication();
    let codeHighlighter = cocodeClient.spawnActor(CodeHighlighter);

    cocodeClient.remote("127.0.0.1", 8000).then(cocodeServer => {
        cocodeClient.initialize(name, cocodeServer, codeHighlighter);
        cocodeServer.registerClient(cocodeClient, name);
    });
}
