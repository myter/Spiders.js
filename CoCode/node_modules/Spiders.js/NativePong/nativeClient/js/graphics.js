/**
 * Created by flo on 06/02/2017.
 */
/**
 * Created by flo on 03/02/2017.
 */

function game(client,roomName){
    // RequestAnimFrame: a browser API for getting smooth animations
    window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame 	   ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback) {
                return window.setTimeout(callback, 1000 / 60); // Callback executed 60 times a second
            };
    })();

    // To stop the animation
    window.cancelRequestAnimFrame = (function() {
        return window.cancelAnimationFrame              ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame    ||
            window.oCancelRequestAnimationFrame      ||
            window.msCancelRequestAnimationFrame     ||
            clearTimeout;
    })();

    // Remove the New room button and the room listing table (else canvas won't work)
    hideRoomListingElements();

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext("2d"); // Create canvas context
    var init;

    canvas.style.display = "inline";
    paintCanvas();

    // Use the whole screen
    var width = window.innerWidth;
    var height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    var balls = []; //var ball;
    var score  = new Score();
    var mouse  = {};
    var portal = new Portal();
    var pallet = new Paddle("bottom");
    var powerups = new PowerUps();
    var scoreTriangle = new ScoreTriangle(0);
    var notificationToDisplay = function() {}; // When notifications need to be displayed on the screen, a drawing function will be assigned

    var opponent = { isPresent: false, reference: null }; // Indicates whether or not there is another player connected in the game
    var firstTime = true;
    var gameScope = this;

    /*
     * Makes a new ball.
     * Arguments are x,y-postion and x,y-velocity.
     */
    function Ball(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.r = 8;
        this.c = "white";
        this.vx = vx;
        this.vy = vy;

        // Function to draw ball on canvas
        this.draw = function() {
            var ballImg = new Image();
            ballImg.src = "img/ball.png";

            // Save the context such that we can later restore it and be able to drax in the canvas again
            ctx.save();

            //Let's clip in a circular region out of the canvas
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
            ctx.closePath();
            ctx.clip();

            //Draw the ball inside the circularly clipped region
            ctx.drawImage(ballImg, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);

            // Restore original context
            ctx.restore();
        };
    };

    // Function to clear the canvas
    function paintCanvas() {
        ctx.clearRect(0, 0, width, height);
    }

    // Function to create paddle objects
    function Paddle(pos) {
        // Height and width
        var relativeHeight = 1.5;  // Height of the pallet relative to the screen height (in %)
        var relativeWidth  = 25; // Width of the pallet relative to the screen width (in %)

        this.height = (relativeHeight / 100) * height;
        this.width  = (relativeWidth / 100) * width;

        // Paddle's position
        this.x = width/2 - this.width/2;
        this.y = (pos == "top") ? 0 : (height - this.height);
    }

    function Portal() {
        this.r = 15; // Radius of the portal
        this.c = "green";
        this.x = getRandomInt(this.r, width - this.r); // Such that the portal is always completely visible
        this.y = getRandomInt(this.r, height/2); // Such that the portal is spawned high enough and completely visible
        this.active = true;


        this.draw = function() {
            ctx.beginPath();
            ctx.fillStyle = this.c;
            ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false); // Draw portal
            ctx.fill(); // Fill portal
        };
    }

    function Score() {
        this.val = 0;
        this.oponentScore = 0;

        this.increaseScore = function(amount) {
            if(opponent.isPresent) {
                this.val += amount;
                exportScore();

                if(this.val >= 1000)
                    endGame("won");
            }
        };

        this.decreaseScore = function(amount) {
            if(opponent.isPresent) {
                this.val -= amount;
                if(this.val < 0)
                    this.val = 0;
                else
                    exportScore();
            }
        };

        this.changeOponentScore = function(score) {
            this.oponentScore = score;

            if(score >= 1000)
                endGame("lost");
        }

        this.draw = function() {
            // Also draw opponent his score
            ctx.fillStyle = "white";
            ctx.font = "20px Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Score : " + this.val + " - " + this.oponentScore, width/2, height/2 + 25 );
        };

        this.reset = function() {
            this.val = 0;
        };
    }

    function ScoreTriangle(i) {
        this.r = 10;

        // Ensure that the score triangle and portal don't collide
        var r1, r2;

        do {
            r1 =  getRandomInt(this.r, width - this.r);
            r2 =  getRandomInt(2*pallet.height, height/2);
        }
        while(collides(portal, { x: r1, y:r2 , r:this.r }, 'circle'));

        // Modulo to be sure we are not drawing out of the screen (could be the case if we are instrumenting because we do ... + i*15)
        this.x = r1 % (width - this.r); // Such that the triangle is always completely visible
        this.y = r2 % height; 		// Such that the triangle is spawned high enough and completely visible
        this.c = "red";

        this.draw = function() {
            // Currently a circle, will be a triangle later
            ctx.beginPath();
            ctx.fillStyle = this.c;
            ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
            ctx.fill();
        };

        this.respawn = function() {
            delete scoreTriangle;
            scoreTriangle = new ScoreTriangle(i+1);
        };

    }

    /*
     * Responsible for all powerups (drawing, handling clicks & handling dragging to portal)
     */
    function PowerUps() {

        /*
         * To click on the powerup we use some error margin. Hence, the user may click on the powerup or up to 4 pixels around the powerup.
         * IMPORTANT : This implies that the different powerup signs are separated far enough from each other.
         *             Else one click could be intepreted as a click on two powerups (when the error margins overlap).
         */

        function PowerupSign(x, y, r, c, powerup, powerupName, duration, imagePath) {
            this.x = x;
            this.y = y;
            this.active = true;

            var that = this;
            var dragging = false;
            var mouseDown = false
            var errorMargin = 20;

            // Will draw the powerup its sign inside a circle of the exact same dimensions as the image
            this.draw = function() {
                var sign = new Image();
                sign.src = imagePath;

                // Save the context such that we can later restore it and be able to drax in the canvas again
                ctx.save();

                //Let's clip in a circular region out of the canvas
                ctx.beginPath();
                ctx.arc(that.x, that.y, r, 0, Math.PI*2, false);
                ctx.closePath();
                ctx.clip();

                //Draw the sign inside the circularly clipped region
                ctx.drawImage(sign, that.x - r, that.y - r, r*2, r*2);

                // Restore original context
                ctx.restore();
            };

            // Handles "clicking" (i.e. a tap) on the powerup
            function interceptClick(event) {
                /*
                 * If user clicked on this powerup sign :
                 *  - execute the powerup
                 *  - desactive the powerup (this.active = false)
                 *  - remove the click event listener
                 */
                mouseDown = false
                if(dragging && collides({ x: that.x, y: that.y, r: r}, portal, "circle")) {
                    if(opponent.isPresent) {
                        // Send powerup invocation to other player
                        that.active = false;

                        sendPowerup(powerupName);
                        removeListeners();
                    }
                    else
                        cancelDragging();
                }
                else if(dragging)
                    cancelDragging();
                else {

                    event.preventDefault();
                    var clickedPoint = { x: event.clientX, y: event.clientY, r: errorMargin }; // We use radius 30 for some error margin (don't need to click exactly on it)

                    if(collides(clickedPoint, { x: that.x, y: that.y, r: r }, "circle")) {
                        // User tapped the pallet powerup sign
                        powerup(true);
                        that.active = false;

                        // Desactive the powerup after "duration" time. (Only pallet powerup lasts for a given time, this explains the below if test)
                        if(duration) {
                            setTimeout(function() {
                                powerup(false);
                            }, duration * 1000);
                        }

                        removeListeners();
                    }
                }
            }

            /*
             * Handles dragging the powerup to the portal.
             */
            function draggingHandler(event) {
                if(mouseDown){
                    var touchedPoint = { x: event.clientX, y: event.clientY, r: errorMargin };

                    if(collides(touchedPoint, { x: that.x, y: that.y, r: r }, "circle")) {
                        dragging = true;
                        // Player is dragging the powerup
                        that.x = touchedPoint.x;
                        that.y = touchedPoint.y;
                    }
                }

            }

            function cancelDragging() {
                // Put powerup back where it was originally
                dragging = false;
                that.x = x;
                that.y = y;
            }

            function handleMouseEvents(event){
                event.preventDefault();
                mouseDown = true
                canvas.addEventListener("mousemove",draggingHandler,false)
                canvas.addEventListener("mouseup",interceptClick,false)
            }

            function removeListeners() {
                canvas.removeEventListener("mousedown",handleMouseEvents)
                canvas.removeEventListener("mousemove",draggingHandler)
                canvas.removeEventListener("mouseup",interceptClick)
            }

            // Set listener to intercept taps and dragging
            canvas.addEventListener("mousedown",handleMouseEvents,false)
        };

        // Draws all powerups that have not yet been used (i.e. that are still active)
        this.draw = function() {
            for(var i = 0; i < powerupSigns.length; i++) {
                if(powerupSigns[i].active)
                    powerupSigns[i].draw();
            }
        }

        // Below functions activate the corresponding powerup.

        /*
         * Long pallet powerup.
         * Argument is a boolean indicating whether the powerup must be activated or desactivated.
         */
        this.palletPowerup = function(activate) {
            // When activating this powerup we make the pallet 3/2 of its original width, hence 100 becomes 150, 80 becomes 120, etc.
            // To bring the pallet back to normal width we must decrease it with a third of its width, e.g. 150 becomes 100, 120 becomes 80, etc.

            if(activate)
                pallet.width += pallet.width / 2;
            else
                pallet.width -= pallet.width / 3;
        }

        /*
         * Extra ball powerup, increases no of balls with one.
         * Spawn ball where the original ball is but with opposite x-velocity.
         */
        this.extraBallPowerup = function() {
            var originalBall = (balls.length >= 1) ? balls[0] : { x: 50, y: 50, vx: -4, vy: -8};
            var b = new Ball(originalBall.x, originalBall.y, -1 * originalBall.vx, originalBall.vy);
            balls.push(b);
        }

        /*
         * Multiball powerup, spawns a multitude of balls in the player's field.
         * Balls are spawned around the first ball, in a random x-direction.
         */
        this.multiballPowerup = function() {
            var amount =  getRandomInt(3, 5);
            var originalBall = (balls.length >= 1) ? balls[0] : { x: 50, y: 50, vx: -4, vy: -8};

            for(var i = 0; i < amount; i++) {
                // Spawn ball around first ball (not too close, nor too far)
                var deltaX = getRandomInt(10, 25);
                var deltaY = getRandomInt(10, 25);

                var leftOrRight = (getRandomInt(0, 1) === 0) ? -1 : 1;
                var xCo = originalBall.x + (leftOrRight * deltaX);

                var aboveOrUnder = (getRandomInt(0, 1) === 0) ? -1 : 1;
                var yCo = originalBall.y + (aboveOrUnder * deltaY);

                // Random x,y-direction
                var newVx = (getRandomInt(0, 1) === 0) ? -1 : 1;
                var xVel  = getRandomInt(4, 6) * newVx;

                var newVy = (getRandomInt(0, 1) === 0) ? -1 : 1;
                var yVel  = getRandomInt(8, 10) * newVy;

                var b = new Ball(xCo, yCo, xVel, originalBall.vy);
                balls.push(b);
            }
        }

        var radius = 15;
        this.eBallSign  = new PowerupSign(width - (radius + 2), radius, radius, "green", this.extraBallPowerup, "eBallPowerup", false, "img/live.png");
        this.palletSign = new PowerupSign(width - (radius + 2), (height / 2) - radius, radius, "blue", this.palletPowerup, "palletPowerup", 20, "img/shield.png");
        this.mBallSign  = new PowerupSign(width - (radius + 2), height - (2 * radius) - 2, radius, "red", this.multiballPowerup, "mBallPowerup", false, "img/boom.png");

        var powerupSigns = [this.eBallSign, this.palletSign, this.mBallSign];
    }

    // Resets the game
    function reset() {
        balls = [new Ball(50, 50, 4, -8)];
        pallet = new Paddle("bottom");
    }

    function endGame(status) {
        paintCanvas(); // To make the field black again

        ctx.fillStyle = "white";
        ctx.font = "20px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if(status === "won")
            ctx.fillText("You win!", width/2, height/2 + 25 );
        else
            ctx.fillText("You lost!", width/2, height/2 + 25 );

        // Stop the animation (gameloop)
        cancelRequestAnimFrame(init);

        // Restart game after 5 seconds
        // TODO : Also display "end game" and "revanche" buttons
        /*
         setTimeout(function() {
         reset();
         animloop();
         }, 5000);
         */
    }

    /*
     * Function to check collision between ball and :
     *  - Pallet  (type = rectangle)
     *  - Portal  (type = circle)
     *  - Powerup (type = circle)
     *  - Score   (type = circle)
     */
    function collides(b, o, type) {
        switch(type) {
            case "rectangle":
                if ((b.x + b.r >= o.x) && (b.x - b.r <= o.x + o.width)) {
                    // Ball is within range of x-coordinates of pallet, possible collision
                    if (b.y >= (o.y - o.height)) {
                        // Ball y coordinate is greater than or equal to te pallet its y coordinate --> collision with bottom pallet
                        return true;
                    }
                    else
                        return false;
                }
                else
                    return false;
                break;
            case "circle":
                /*
                 * Collision detection between circles, based on : http://stackoverflow.com/questions/1736734/circle-circle-collision
                 * Determine length of line between center of the two circles (ball and other circle object)
                 * If length <= ball's radius + object's radius --> collision
                 * Hence, collision if : (x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2
                 * Use Pythagoras to calculate line distance
                 */
                return (Math.pow(b.x - o.x, 2) + Math.pow(b.y - o.y, 2) <= Math.pow(b.r + o.r, 2));
                break;
        }
    }

    function removeBall(ball) {
        // Remove ball from array of balls
        var idx = balls.indexOf(ball);
        balls.splice(idx, 1);
        delete ball;

        // If there are no more balls on the field make one
        if(balls.length === 0)
            setTimeout(function() {
                balls.push(new Ball(width/2, height/2, 4, -8));
            }, 1000);
    }

    function update(ball) {
        // Move the ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        /*
         * Collision detection
         * Check if ball hits a wall or pallet or portal
         */
        if (portal.active && opponent.isPresent && collides(ball, portal, "circle")) {
            // There is another player, send ball to him
            ball.c  = "black"; // Hide ball

            // Both draws below are just details, ignore it
            ball.draw();   // Such that the ball is hidden
            portal.draw(); // Else there will be a black print on the position where the ball collided with the portal.

            // Send ball and remove it from its array, as we don't have it anymore
            sendBall(ball);
        }
        else if (collides(ball, scoreTriangle, 'circle')) {
            // Ball collides with score triangle
            score.increaseScore(100);

            // Spawn a new one
            scoreTriangle.respawn();
        }
        else if (collides(ball, pallet, "rectangle")) {
            ball.vy = -ball.vy;
        }
        else {
            if (ball.y + ball.r > height) {
                // Ball hit floor
                ball.y = height - ball.r; // put ball properly against wall

                // Remove ball from array
                removeBall(ball);

                score.decreaseScore(100);
            }
            else if (ball.y < 0) {
                // Ball hit ceiling, invert y-velocity vector
                ball.vy = - ball.vy;
                ball.y  = 0;
            }

            // If ball strikes the vertical walls, invert the x-velocity vector
            if (ball.x + ball.r > width) {
                ball.vx = - ball.vx;
                ball.x  = width - ball.r;
            }
            else if (ball.x - ball.r < 0) {
                ball.vx = - ball.vx;
                ball.x  = ball.r;
            }
        }
    }

    /*
     * Draws everything on canvas
     */
    function draw() {
        /*
         * In order not to draw the background in each iteration we have put the background in ht css and we only redraw the ball, powerups, pallet, etc in each iteration.
         */
        paintCanvas();

        ctx.fillStyle = "white";
        ctx.fillRect(pallet.x, pallet.y, pallet.width, pallet.height);

        score.draw();
        powerups.draw();

        for(var i = 0; i < balls.length; i++) {
            balls[i].draw();
            update(balls[i]);
        }

        if(!firstTime) {
            portal.draw();
        }

        firstTime = false;

        scoreTriangle.draw();
        notificationToDisplay();
    }

    // Function for running the whole animation
    function animloop() {
        init = requestAnimFrame(animloop);
        draw();
    }

    // Track the position of mouse cursor
    function trackPosition(e) {
        mouse.x = e.pageX;
        mouse.y = e.pageY;
    }

    /*
     * Handles device orientation in order to move the pallets
     */
    function devOrientHandler(eventData) {
        /*
         * beta ranges between -180 and 180 degrees
         * When the device is held horizontally (i.e. in landscape mode) the angle will be 0°
         * Rotating the device to the left/right will respectively increase/decrease beta.
         *
         * Hence, in our maximal rotation to the left the alpha will be : 180° + 90° = 270°
         * in our maximal rotation to the right alpha will be : 180° - 90° = 90°
         */

        var dir = eventData.beta;

        /*
         * Map this direction to a coordinate on the screen
         *
         * We know it will be in the range [-70, 70]
         * Normalize it to be in the range [-1, 1]
         */

        var normalizedDir = dir / -70;
        var newX = pallet.x + (normalizedDir * 100);

        if(newX > (width - pallet.width))
            newX = width - pallet.width; // Avoid going out of screen
        else if(newX < 0)
            newX = 0;

        pallet.x = newX;
    }

    function handleArrowPress(event){
        event = event || window.event;
        if (event.keyCode == '37') {
            pallet.x = pallet.x - 50
        }
        else if (event.keyCode == '39') {
            pallet.x = pallet.x + 50
        }
    }

    /*
     * If supported, track device momevements to move the pallets
     * "hasBall" argument indicates whether the player initiates the game and starts with the ball, or joined and has no ball untill it is sent to him via a portal.
     */
    this.start = function(hasBall) {
        if(!hasBall) {
            opponent.isPresent = true; // We don't have the ball, hence we joined a game, hence there is another player
            draw(); // To draw the score, powerups, etc.
        }
        else {
            balls.push(new Ball(50, 50, 4, -8));
            firstTime = false;
        }

        document.onkeydown = handleArrowPress
        animloop()
    };

    this.playerJoined = function(nickname) {
        opponent.isPresent = true;
        notificationToDisplay = function() {
            ctx.fillStyle = "white";
            ctx.font = "20px Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(nickname + " joined the game", width/2, 20); // Nog nickname laten invoeren in begin van spel en die dan meegeven in AmbientjS objetc da notification is
            // en dan daar deze functie oproepen samen met de nickname
        };

        // Remove notification after 3 seconds
        setTimeout(function() {
            notificationToDisplay = function() {};
        }, 3000);
    };

    this.receiveOpponentScore = function(newScore) {
        score.changeOponentScore(newScore);
    };

    this.receiveBall = function(b) {
        balls.push(new Ball(b.x, b.y, b.vx, b.vy));
        opponent.isPresent = true; // We received ball from another player, hence, there is another player

        // Desactive portal for 2 seconds, such that after receiving the ball it does not collide with the portal
        portal.active = false;
        setTimeout(function() {
            portal.active = true;
        }, 2000);
    };

    this.receivePortal = function(p) {
        // We receive relative "x,y-coordinates" --> multiply with width/height to get the horizontal/vertical position where it should be drawed
        portal.x = p.x * width;
        portal.y = p.y * height;
        portal.r = p.r;
        portal.c = p.c;
        portal.draw();
    };

    this.receivePowerup = function(type) {
        switch(type) {
            case "eBallPowerup":
                powerups.extraBallPowerup();
                break;
            case "mBallPowerup":
                powerups.multiballPowerup();
                break;
            case "palletPowerup":
                powerups.palletPowerup(true);
                break;
        }
    };

    this.setOpponentReference = function(name) {
        opponent.reference = name;
        opponent.isPresent = true;
    };

    this.getRoomName = function() {
        return roomName;
    };

    this.getPortal = function() {
        // Return relative "x,y-coordinates" --> Number between 0 and 1 indicating where on the screen the portal is located
        return { x: portal.x / width, y: portal.y / height, r: portal.r, c: portal.c };
    };

    // Function to send ball to opponent
    function sendBall(ball) {
        // Remove ball from array of balls in current field
        var i = balls.indexOf(ball);
        balls.splice(i, 1);
        client.sendBallTo(opponent.reference,ball.x, ball.y, ball.vx, ball.vy)
        delete ball;
    }

    function exportScore() {
        if(opponent.isPresent) {
            client.sendScoreChangeTo(opponent.reference,score.val)
        }
    }

    function sendPowerup(type) {
        if(opponent.isPresent) {
            client.sendPowerupTo(opponent.reference,type)
        }
    }

}

// Remove the New room button and the room listing table (else canvas won't work)
function hideRoomListingElements() {
    var nickLabel = document.getElementById('nickLabel')
    nickLabel.style.display = "none"

    var nickNameInput = document.getElementById('nickname');
    nickNameInput.style.display = "none";

    var nameInput = document.getElementById('roomName');
    nameInput.style.display = "none";

    var button = document.getElementById('newRoomButton');
    button.style.display = "none";

    var startButton = document.getElementById('startButton');
    startButton.style.display = "none";

    var table = document.getElementById('roomList');
    table.style.display = "none";

    document.body.style.backgroundImage = "url('img/tennis_background.png')";
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.game = game