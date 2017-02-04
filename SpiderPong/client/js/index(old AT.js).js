var AmbientJS = require('./AmbientJS/AmbientJS');
var currentGame = false;

// Variables for instrumentation
var instrumenting = true; // Boolean indicating if we want to do instrumentation or not
var instrumentationName = false;
var instrumentationRef = false;

AmbientJS.events.addListener('AmbientJS-Ready', function() { 
	AmbientJS.online(); 
	
	// If we want to do some instrumentation, call "instrumentation" to run automated testing
	if(instrumenting)
		instrument(startGame);

	document.getElementById("newRoomButton").onclick = startGame;
	function startGame() {
		var roomName = document.getElementById('roomName').value;
		currentGame = new game(AmbientJS, roomName, instrumenting);

		// Make AmbientJS game object for distribution
		var exportedGame = AmbientJS.createObject({
			"getType"          : function () { return "game"; },
			"getName"          : function () { return roomName; },
			"getPortal"        : function () { return currentGame.getPortal(); },
			"scoreChange"      : function (score) { currentGame.receiveOpponentScore(score); },
			"receiveBall"      : function (x, y, vx, vy) { currentGame.receiveBall({ x: x, y: y, vx: vx, vy: vy }); },
			"receivePowerup"   : function (type) { currentGame.receivePowerup(type); },
			"playerJoinedGame" : function (nickname) { currentGame.playerJoined(nickname); }
		});

		AmbientJS.exportAs(exportedGame, "WePong_Game");
		currentGame.start(true);		
	}

	// Discover game on network
	AmbientJS.wheneverDiscovered("WePong_Game", function(reference) {
		// Found a game
		var getTypeMsg = AmbientJS.createMessage("getType", []);
		var f          = reference.asyncSend(getTypeMsg, "twoway");

		f.whenBecomes(function(type) {
			switch(type) {
				case "game":
					// Found game
					var row = document.getElementById('roomList').insertRow(); // Insert row at last position
					
					var nameCell = row.insertCell();
					var noPlayersCell = row.insertCell();

					// Get room name
					var getNameMsg = AmbientJS.createMessage("getName", []);
					var future     = reference.asyncSend(getNameMsg, "twoway");

					future.whenBecomes(function(name) {
						row.id = name;
						nameCell.innerHTML = name;
						noPlayersCell.innerHTML = "1/2";
						instrumentationName = name;
						instrumentationRef  = reference;

						row.onclick = function() { 
							if(noPlayersCell.innerHTML === "1/2") {
								joinGame(name, reference);
							}
						};
					});

					break;
				case "player":
					// Received "notification" that a player joined a game
					
					// Get room name
					var getRoomMsg = AmbientJS.createMessage("getRoom", []);
					var future     = reference.asyncSend(getRoomMsg, "twoway");

					future.whenBecomes(function(roomName) {
						if(currentGame && (roomName === currentGame.getRoomName())) {
							// Player joined our game, store the reference that is pointing to him
							currentGame.setOpponentReference(reference);
						}
						else {
							// Only display 2/2 if player did not join our game, because if we are in game, we already removed the table !
							document.getElementById(roomName).cells[1].innerHTML = "2/2";
						}
					});

					break;
			}
		}) 
	});
});

function joinGame(roomName, reference) {
	var nickname = document.getElementById('nickname').value;
	currentGame = new game(AmbientJS, roomName, instrumenting);
	currentGame.setOpponentReference(reference); // Store the reference to our opponent
	
	// Notify other player we joined him
	var notificationMsg = AmbientJS.createMessage("playerJoinedGame", [nickname]);
	reference.asyncSend(notificationMsg, "oneway");

	// Also export an object to notify other players that we joined the game and such that our opponent has a reference to us !
	var notification = AmbientJS.createObject({
		"getType"     : function () { return "player"; },
		"getRoom"     : function () { return roomName; },
		"receiveBall" : function (x, y, vx, vy) { currentGame.receiveBall({ x: x, y: y, vx: vx, vy: vy }); },
		"scoreChange" : function (score) { currentGame.receiveOpponentScore(score); },
		"receivePowerup" : function (type) { currentGame.receivePowerup(type); }
	});
	AmbientJS.exportAs(notification, "WePong_Game");
	

	// Fetch the portal (such that portal is at the same place at both players)
	var getPortalMsg = AmbientJS.createMessage("getPortal", []);
	var future       = reference.asyncSend(getPortalMsg, "twoway");

	future.whenBecomes(function(portal) {
		currentGame.receivePortal(portal);
	}); 

	currentGame.start(false); // false indicates we joined the game and hence don't have the ball				
}

// Instrumentation
function instrument(startGame) {
	// Fill in a nickname and a room name
	document.getElementById('nickname').value = "Instrumentor";
	document.getElementById('roomName').value = "Instrumentation Room";

	// If after 10 seconds no game has been found, we assume we are the first player to open the game, hence, we start a game
	setTimeout(function() {
		if(instrumentationName && instrumentationRef) //(instrumentationName && instrumentationRef)
			joinGame(instrumentationName, instrumentationRef);
		else
			startGame();
	}, 10000);
}