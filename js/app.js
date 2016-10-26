/* enable character selection before start and disable character selection after start*/
var enableCharacterSelection;
var disableCharacterSelection;

$(function() {

    var boy = $('#char-boy');
    var catGirl = $('#char-cat-girl');
    var hornGirl = $('#char-horn-girl');
    var pinkGirl = $('#char-pink-girl');
    var princessGirl = $('#char-princess-girl');

    var characters = [boy, catGirl, hornGirl, pinkGirl, princessGirl];
/* princess girl is the default character*/
    princessGirl.css({
        'background-color': "red"
    }).addClass("active");
    player.setSprite();
/*set background color during character selection*/
    var resetCharBackground = function() {
        for (var i = 0; i < characters.length; i++) {
            characters[i].animate({
                'background-color': "white"
            }, 0).removeClass("active");
        }
    };
/*set background for active character*/
    var selectCharacter = function(that) {
        $(that).animate({
            'background-color': "blue"
        }, 1000).addClass("active");
        player.setSprite();
    };
/* enable character selection before and after a game */
    enableCharacterSelection = function() {
        for (var i = 0; i < characters.length; i++) {
            characters[i].click(function() {
                resetCharBackground();
                selectCharacter(this);
            });
        }
    };
    enableCharacterSelection();
/* call this function to enable character selection before the first game is started*/

    disableCharacterSelection = function() { /* disable character selection during a game*/
        for (var i = 0; i < characters.length; i++) {
            characters[i].off("click");
        }
    };
});
//=========================================================
// HELPER METHODS
//=========================================================

var GAME_DURATION = 60000; /* set game duration in milliseconds*/
var NUM_ENEMIES = 4;

var COLLECTIBLE_Y_POS_ADJUST = 20;/* number of pixels to subtract from y position to place collectible on canvas*/
var NUM_PLAY_COLLECTIBLES = 3;/* randomly chosen number of collectibles*/
//=========================================================
// SCREEN ENTITY - SUPER CLASS FOR ALL THINGS THAT APPEAR ON SCREEN
//=========================================================
var LEN_X = 101;
var LEN_Y = 83;

var PLAYER_START_X_POS = 2 * LEN_X;
var PLAYER_START_Y_POS = 5 * LEN_Y;
var PLAYER_MIN_X_POS = 0;
var PLAYER_MIN_Y_POS = -40;
var PLAYER_MAX_X_POS = 4 * LEN_X;
var PLAYER_MAX_Y_POS = 5 * LEN_Y;
var playerPrevXPos;
var playerPrevYPos;

var ENEMY_MAX_X_POS = 5 * LEN_X;

var COLLECTIBLES = [
    ['images/Gem Blue.png', 30],
    ['images/Gem Green.png', 30],
    ['images/Gem Orange.png', 30],
    ['images/Heart.png', 10],
    ['images/Star.png', 10],
    ['images/Rock.png', 0],
    ['images/Key.png', 10],
    ['images/Selector.png', 50]
];
//=========================================================
// ENEMY CLASS
//=========================================================

/* enemy function*/
var Enemy = function(startX, startY) {
    /* Variables applied to each of our instances go here
       The image/sprite for our enemies*/
    this.sprite = 'images/enemy-bug.png';
    this.x = startX;
    this.y = startY;
    this.speed = Math.floor((Math.random() * 100) + 100);
};
/* Update enemy position*/
Enemy.prototype.update = function(dt) {
    if (this.x > ENEMY_MAX_X_POS) {
        this.x = -(Math.floor((Math.random() * 5) + 1) * LEN_X);
        this.y = Math.floor((Math.random() * 3) + 1) * LEN_Y;
    } else {
        this.x = this.x + (this.speed * dt);
    }
};
/* Render enemy onto the screen*/
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//=========================================================
// COLLECTABLE - SUPER CLASS FOR ALL POWER UP ITEMS
//=========================================================
/*collectibles*/
var Collectible = function(img, points, xPos, yPos) {
    this.sprite = img;
    this.points = points;
    this.x = xPos;
    this.y = yPos;
    this.fading = false;
    this.toDestroy = false;
};
/*render collectibles onto the screen*/
Collectible.prototype.render = function() {
    if (this.toDestroy) {
        this.remove();
    } else {
        if (this.fading) {
            ctx.globalAlpha = 0.5;
        }
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.globalAlpha = 1;
    }
};

Collectible.prototype.remove = function() {
    canvasCollectibles.splice(canvasCollectibles.indexOf(this), 1);
};
/*set dissapear time for collectibles*/
Collectible.prototype.disappear = function(fadeTime) {
    var that = this;
    var destroyTime = fadeTime + 2000;

    setTimeout(function() {
        that.fading = true;
    }, fadeTime);

    setTimeout(function() {
        that.toDestroy = true;
    }, destroyTime);
};

Collectible.prototype.move = function() {
    var that = this;
    var EXPIRE_TIME = 5000;

    setTimeout(function() {
        setInterval(function() {
            if (that.y < 415) {
                that.y = that.y + 1;
            } else {
                clearInterval();
                that.disappear(0);
            }
        }, 1);
    }, EXPIRE_TIME);
};


//=========================================================
// PLAYER CLASS
//=========================================================
// Now write your own player class

var Player = function() {
    // Variables applied to each of our instances go here,
    // The image/sprite for our enemies
    this.setSprite();
    this.x = PLAYER_START_X_POS;
    this.y = PLAYER_START_Y_POS;
    this.score = 0;
};

Player.prototype.setSprite = function() {
    this.sprite = $('.active').attr('src');
};
/*Update player position to start and update points after water block is reached*/
Player.prototype.update = function(dt) {
    if (this.y <= 0) {
        this.score += 20;
        this.reset(this.score);
        placeCollectiblesOnCanvas();
    }
};
/*render player onto the screen*/
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
/* setting up key controls*/
Player.prototype.handleInput = function(key) {

    switch (key) {
        case 'left':
            var leftPos = this.x - LEN_X;
            if (leftPos >= PLAYER_MIN_X_POS) {
                this.x = leftPos;
            }
            break;
        case 'up':
            var upPos = this.y - LEN_Y;
            if (upPos >= PLAYER_MIN_Y_POS) {
                this.y = upPos;
            }
            break;
        case 'right':
            var rightPos = this.x + LEN_X;
            if (rightPos <= PLAYER_MAX_X_POS) {
                this.x = rightPos;
            }
            break;
        case 'down':
            var downPos = this.y + LEN_Y;
            if (downPos <= PLAYER_MAX_Y_POS) {
                this.y = downPos;
            }
            break;
    }
};

Player.prototype.reset = function(score) {
    this.x = PLAYER_START_X_POS;
    this.y = PLAYER_START_Y_POS;
    this.score = score;
    var scoreEl = document.getElementById('score');
    scoreEl.innerHTML = this.score;
};

Player.prototype.collect = function(score) {
    this.score += score;
};
//=========================================================
// OBJECT INSTANTIATION
//=========================================================

var allEnemies;
/* Place all enemy objects in an array called allEnemies*/
function placeEnemiesOnCanvas() {
    allEnemies = [];
    for (var i = 0; i < NUM_ENEMIES; i++) {
        var startX = -(Math.floor((Math.random() * 5) + 1) * LEN_X);
        var startY = Math.floor((Math.random() * 3) + 1) * LEN_Y;
        allEnemies.push(new Enemy(startX, startY));
    }
}

function removeEnemiesFromCanvas() {
    allEnemies = [];
}

var allCollectibles;
/*place all collectibles in an array called allCollectibles*/
var canvasCollectibles;
function placeCollectiblesOnCanvas() {
    allCollectibles = [];
    canvasCollectibles = [];

    COLLECTIBLES.forEach(function(collectible) {
        allCollectibles.push(collectible);
    });
    var positions = [];
    var xPos, yPos;
    var playCollectibleImgPoints = [];

    for (var x = 0; x < NUM_PLAY_COLLECTIBLES; x++) {
        var index = Math.floor(Math.random() * allCollectibles.length);
        playCollectibleImgPoints.push(allCollectibles[index]);
        allCollectibles.splice(index, 1);
    }
/*place the first collectible on the canvas and place each collectible on its own tile*/
    for (var i = 0; i < playCollectibleImgPoints.length; i++) {
        xPos = Math.floor((Math.random() * 5) + 0) * LEN_X;
        yPos = (Math.floor((Math.random() * 3) + 1) * LEN_Y) - COLLECTIBLE_Y_POS_ADJUST;
        if (positions.length !== 0) {
            var position = checkPosition(positions, xPos, yPos);
            xPos = position[0];
            yPos = position[1];
        }
        canvasCollectibles.push(new Collectible(playCollectibleImgPoints[i][0], playCollectibleImgPoints[i][1], xPos, yPos));
        positions.push([xPos, yPos]);
      }
/*function to make sure that only one collectible is placed on one tile*/
    function checkPosition(positions, xPos, yPos) {
        for (var j = 0; j < positions.length; j++) {
            if ((xPos == positions[j][0]) && (yPos == positions[j][1])) {
                xPos = Math.floor((Math.random() * 5) + 0) * LEN_X;
                yPos = (Math.floor((Math.random() * 3) + 1) * LEN_Y) - COLLECTIBLE_Y_POS_ADJUST;
                return checkPosition(positions, xPos, yPos);
            }
        }
        return [xPos, yPos];
    }
/*Gems disappear if not collected*/
    for (var i = 0; i < canvasCollectibles.length; i++) {
        if ((canvasCollectibles[i].sprite).indexOf("Gem") > -1) {
            canvasCollectibles[i].disappear(3000);
        }
    }
}

function removeCollectiblesFromCanvas() {
    canvasCollectibles = [];
}

// Place the player object in a variable called player
var player = new Player();
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
// After adding a timer to the game, there is an activateKeys AND deactivateKeys function
// game start activate the keys, game over deactivate the keys

function activateKeys() {
    console.log("activateKeys");
    document.addEventListener('keyup', keyFunction);
}

function deactivateKeys() {
    console.log("deactivateKeys");
    document.removeEventListener('keyup', keyFunction);
}

function keyFunction(e) {
    /*Update player position when hitting an obstacle to the same position*/
    playerPrevXPos = player.x;
    playerPrevYPos = player.y;

    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
}
/*set a timer for game duration*/
var timerEl = document.getElementById('timer');
var timer;
var gameInterval;

function gameStart() {
    player.render();/*placing active character as player*/
    activateKeys();/*activate control keys after game starts*/
    placeEnemiesOnCanvas();/* placing enemies on the screen*/
    timer = GAME_DURATION / 1000;
    timerEl.innerHTML = timer;
    gameInterval = setInterval(function() {
        timer -= 1;
        timerEl.innerHTML = timer;
    }, 1000);
    disableCharacterSelection();
}

function gameStop() {
    deactivateKeys();/*activate control keys after game starts*/
    removeEnemiesFromCanvas();
    timerEl.innerHTML = 0;
    clearInterval(gameInterval);
    player.reset(0);
    removeCollectiblesFromCanvas();
    enableCharacterSelection();
}