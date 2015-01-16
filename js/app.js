//global vars
var CANVAS_DIMENSIONS = [505, 606];
var ENEMY_HEIGHTS = [63, 146, 229];
var ENEMY_IMAGE = ['images/enemy-bug-grn.png', 'images/enemy-bug-org.png', 'images/enemy-bug-prp.png'];
var PLAYER_IMAGES = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-princess-girl.png'
    ];
var AVATAR_RECT_IMAGES = [
        'images/char-boy-rect.png',
        'images/char-cat-girl-rect.png',
        'images/char-horn-girl-rect.png',
        'images/char-princess-girl-rect.png'
    ];
var PRIZE_IMAGE = ['images/Heart.png', 'images/Key.png', 'images/Star.png'];
var MIC_IMAGE = ['images/mic50x50.jpg', 'images/mic_grey.jpg']; //first image for audio player on, second image for off
var ENEMY_VELOCITY = [25, 90];
var PLAYER_START_LOC = [202, 405];
var PLAYER_MOVE = [101, 83];
var PRIZE_X = [0, 101, 202, 303, 404];
var PRIZE_Y = [72, 155, 238];
var score = 0;
var lives = 3;
var gameStarted = false;
var avatarIdx = 0;

//helper functions
/**
 * Random integer generator
 * @param {integer} min - Minimum range of the resulting random number (inclusive).
 * @param {integer} max - Maximum range of the resulting random number (exclusive). Essentially the maximum will be max - 1.
 * @returns {integer} - Random number between min and (max - 1), inclusive.
 */
function getRandomInt(min, max) { 
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Use to determine enemy-player collisions. Each stone is considered a cell in a grid.
 * If the player and enemy are in the same cell simultaneously, a collision will be detected in Player's checkCollisions() function.
 * @param {integer} x - X position of the current item (i.e. bug, player, prize)
 * @param {integer} y - Y position of the current item
 * @returns {array of integers} - The first element of the array represents the column number for the item location on the stones. 
       The second element represents the row number for the item location on the stones.
       If the item is not on any stone, the return value will be [-1, -1].
 */
function getStoneCell(x, y) {
    var stoneCell = [];
    var cellx = -1;
    var celly = -1;
    if (x >= 0 && x < CANVAS_DIMENSIONS[0] && y >= 63 && y <=249) {
        if (x % 101 >= 51) { //makes collision detection a little more sensitive when bug is midway between cells
            cellx = Math.ceil(x / 101);
        } else {
            cellx = Math.floor(x / 101);
        }
        celly = Math.floor(y / 83);
    }
    stoneCell[0] = cellx;
    stoneCell[1] = celly;

    return stoneCell;
}

//classes
/**
 * Represents an element which is dynamic. Superclass to elements such as player, enemy, prizes.
 * @constructor
 * @param {integer} x - initial X position for the element
 * @param {integer} x - initial Y position for the element
 */
var DynamicElement = function(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = ''; //url for the image
};

/** Renders a dynamic element */
DynamicElement.prototype.render = function() {
    if (lives > 0) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

/**
 * Enemies our player must avoid
 * @constructor
 * @param {integer} x - initial X position for the element
 * @param {integer} x - initial Y position for the element
 */
var Enemy = function(x, y) {
    DynamicElement.call(this, x, y);
    this.sprite = ENEMY_IMAGE[getRandomInt(0, 3)];
    this.velocity = getRandomInt(ENEMY_VELOCITY[0], ENEMY_VELOCITY[1]);
};

Enemy.prototype = Object.create(DynamicElement.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * Update the enemy's position, required method for game
 * @param {integer} dt - a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x < CANVAS_DIMENSIONS[0] + 101) {
        this.x += this.velocity * dt;
    }
    if (this.x > CANVAS_DIMENSIONS[0]) {
        this.reset();
    }
};

/**
 * Reset the enemy's position after it has moved off the right edge. Gives a random velocity and initial position.
 * @param {integer} dt - a time delta between ticks
 */
Enemy.prototype.reset = function() {
    this.x = getRandomInt(-500, 1); //staggers the timing when the bug will reappear on the screen
    this.y = ENEMY_HEIGHTS[getRandomInt(0, 3)];
    this.velocity = getRandomInt(ENEMY_VELOCITY[0], ENEMY_VELOCITY[1]);
};

// This class requires an update(), render() and
// a handleInput() method.
/**
 * Represents the game player
 * @constructor
 * @param {integer} x - initial X position for the element
 * @param {integer} x - initial Y position for the element
 * @param {integer} avatarIdx - indicates the player's selected avatar and will be used to display the
 *      appropriate image.
 */
var Player = function(x, y) {
    //not sure if I should write a unique constructor to take in the avatar index as param
    DynamicElement.call(this, x, y);
    this.sprite = PLAYER_IMAGES[avatarIdx]; //path for the player image
};

Player.prototype = Object.create(DynamicElement.prototype);
Player.prototype.constructor = Player;

/** 
 * Handles key inputs for player controls. Moves the player by one grid cell value in the given direction.
 * Prevents the player from moving off the screen when moving near the left edge, right edge, or bottom edge.
 * @param {string} direction - Values may be 'left', 'right', 'up', or 'down' and correspond to key inputs.
 */
Player.prototype.handleInput = function(direction) {
    if (direction == 'left') {
        if (this.x - PLAYER_MOVE[0] >= 0) { //checks that player can't move off screen left
            this.x -= PLAYER_MOVE[0];
        }
    } else if (direction == 'up') {
        this.y -= PLAYER_MOVE[1];
    } else if (direction == 'right') { //checks that player can't move off screen right
        if (this.x + PLAYER_MOVE[0] < CANVAS_DIMENSIONS[0]) {
            this.x += PLAYER_MOVE[0];
        }
    } else { //direction == 'down' 
        if (this.y + PLAYER_MOVE[1] <= PLAYER_START_LOC[1]) { //checks that player can't move below initial screen y position
            this.y += PLAYER_MOVE[1];
        }
    }
};

/** If the player falls into the water, calls the player's reset() function and decrements the lives count by 1.*/
Player.prototype.update = function() {
    if (this.y < 63) {
        this.reset();
        lives -= 1;
    }
};

/** 
 * Checks whether the player has collided with any bug or prize. If there is a collision with a bug, the player's reset() will be
       called and the lives count will be decremented by 1. If there is a collision with a prize, the prize's reset() will be 
       called and the score will be incremented by 1.
 */
Player.prototype.checkCollisions = function() {
    var playerStoneCell = [];
    var enemyStoneCell = [];
    var prizeStoneCell = [];

    //check for collision with bug
    playerStoneCell = getStoneCell(this.x, this.y);
    for (var i=0; i < allEnemies.length; i++) {
        enemyStoneCell = getStoneCell(allEnemies[i].x, allEnemies[i].y);
        if (playerStoneCell[0] == enemyStoneCell[0] && playerStoneCell[1] == enemyStoneCell[1] && enemyStoneCell[0] >= 0 && enemyStoneCell[1] >=0) {
            this.reset();
            lives -= 1;
        }
    }
    //check for collision with prize
    prizeStoneCell = getStoneCell(prize.x, prize.y);
    if (playerStoneCell[0] == prizeStoneCell[0] && playerStoneCell[1] == prizeStoneCell[1]) {
        prize.reset();
        score += 1;
    }
};

/** Updates the player to its starting position.*/
Player.prototype.reset = function() {
    this.x = PLAYER_START_LOC[0];
    this.y = PLAYER_START_LOC[1];
};

// This class requires an update(), render() and
// a handleInput() method.
/**
 * Represents the player's avatar
 * @constructor
 * @param {integer} x - initial X position for the element
 * @param {integer} y - initial Y position for the element
 * @param {integer} avatarIdx - indicates the index of the avatar and will be used to display the
 *      appropriate image.
 * @param {boolean} isSelected - indicates whether the avatar is currently selected by the user.
 *      on initial creation, the first avatar will be selected.
 */

var Avatar = function(x, y, avatarIndex) { //, isSelected
//    DynamicElement.call(this, x, y);
    this.x = x;
    this.y = y;
    this.idx = avatarIndex;
    if (this.idx == avatarIdx) {
        this.sprite = AVATAR_RECT_IMAGES[this.idx]; //path for the player image with rectangle
    } else if (this.idx != avatarIdx) {
        this.sprite = PLAYER_IMAGES[this.idx]; //path for the player image without rectangle
    }
};

/** Renders a dynamic element */
Avatar.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Update the avatar's sprite if user selection has changed
 */
Avatar.prototype.update = function() {
    if ((this.idx) == avatarIdx) {
        this.sprite = AVATAR_RECT_IMAGES[this.idx]; //path for the player image with rectangle
    } else {
        this.sprite = PLAYER_IMAGES[this.idx];
    }
};

/**
 * Represents a prize, such as heart or star.
 * @constructor
 * @param {integer} x - initial X position for the element
 * @param {integer} x - initial Y position for the element
 */
 var Prize = function(x, y) {
    DynamicElement.call(this, x, y);
    this.sprite = PRIZE_IMAGE[getRandomInt(0, 3)]; //gets a random image path
};
Prize.prototype = Object.create(DynamicElement.prototype);
Prize.prototype.constructor = Prize;

/** After the player has collected a prize, the prize is reset with a new, random location and random image.*/
Prize.prototype.reset = function() {
    this.x = PRIZE_X[getRandomInt(0, 5)];
    this.y = PRIZE_Y[getRandomInt(0, 3)];
    this.sprite = PRIZE_IMAGE[getRandomInt(0, 3)];
};

/**
 * Represents the audio icon.
 * @constructor
 * @param {integer} x - Initial X position for the element
 * @param {integer} x - Initial Y position for the element
 * @property {integer} on - If the value is 1, the audio player should be on. If the value is -1, the audio player should be paused.
 */
var AudioIcon = function(x, y) {
    DynamicElement.call(this, x, y);
    this.sprite = ''; //url to the image
    this.on = 1;
};

AudioIcon.prototype = Object.create(DynamicElement.prototype);
AudioIcon.prototype.constructor = AudioIcon;

/** 
 * Toggles the audio player to play or pause depending on the this.on property value. When paused, the image should display in grey. 
 * When playing, the image should display in black.
 */
AudioIcon.prototype.update = function() {
    if (this.on > 0) {
        this.sprite = 'images/mic50x50.jpg';
        document.getElementById("bgdAudio").play();
    } else { // pause audio player
        this.sprite = 'images/mic_grey.jpg';
        document.getElementById("bgdAudio").pause();
    }
};

/** Called by a click event listener so that when the player clicks the audio icon, it will toggle the this.on value.*/
AudioIcon.prototype.togglePlay = function() {
    this.on *= -1; //toggle audio element to play or pause
};

/**
 * Represents a text element. Used for the score and lives count.
 * @constructor
 * @param {string} str - Static part of the text element
 * @param {integer} num - Numeric part of the text element. For ex. lives count or score value.
 */
var Text = function(str, num) {
    this.str = str;
    this.displayStr = this.str + ' ' + num.toString();
};

/** Updates the text element with the latest relevant numeric count (for lives or score).*/
Text.prototype.update = function(curCount) { //not completely sure why this was necessary but otherwise lives count would not update onscreen
    this.displayStr = this.str + ' ' + curCount.toString();
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
// var allAvatars = [];

// for (var k = 0; k < 4; k++) {
//     var avatar = new Player(50 + k * 101, 0);
//     allAvatars.push(avatar);
// }

var allAvatars = [];
var avatar = new Avatar(50, 0, 0);
allAvatars.push(avatar);

for (var k = 1; k < 4; k++) {
    var avatar1 = new Avatar(50 + 101 * k, 0, k);
    allAvatars.push(avatar1);
}


// console.log('length allAvatars: ' + allAvatars.length);
// console.log('sprite avatar0: ' + allAvatars[0].sprite);

var player = new Player(PLAYER_START_LOC[0], PLAYER_START_LOC[1]);
var allEnemies = [];

for (var j = 0; j < 5; j++) {
    var enemy = new Enemy(0, ENEMY_HEIGHTS[getRandomInt(0, 3)]);
    allEnemies.push(enemy);
}

var prize = new Prize(303, 155);
var livesText = new Text('Lives', lives);
var scoreText = new Text('Score', score);

/** Renders the Score at the left edge.*/
scoreText.render = function() {
    var metrics = ctx.measureText(this.displayStr);
    ctx.clearRect(0, 0, metrics.width, 43);
    ctx.fillStyle = 'black';
    ctx.font = '24pt Arial'; //not sure why this is not getting applied
    ctx.fillText(this.displayStr, 0, 40);
};

/** Renders the Lives at the right edge.*/
livesText.render = function() {
    var metrics = ctx.measureText(this.displayStr);
    ctx.clearRect(CANVAS_DIMENSIONS[0] - metrics.width, 0, metrics.width, 43);
    ctx.fillStyle = 'black';
    ctx.font = '24pt Arial';
    ctx.fillText(this.displayStr, CANVAS_DIMENSIONS[0] - metrics.width, 40);
};

var audioIcon = new AudioIcon(CANVAS_DIMENSIONS[0] - 180, 0, 38, 38);

/**This listens for key presses and sends the keys to your
 *     Player.handleInput() method. You don't need to modify this.
 *     Updated from initial logic using event.keyCode b/c MDN mentioned deprecated (OK for firefox).
 *     But having a challenge finding which keyboard event value format Chrome is currently using.
 *     Might have to accept both e.key and e.keyCode?
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = ['Left', 'Right', 'Down', 'Up', 'k', 'i', 'j', 'l'];
    var allowedKeyCodes = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        73: 'up',
        74: 'left',
        75: 'down',
        76: 'right'
    };

    // console.log(e.key);

    if (e.keyCode != undefined) {
        player.handleInput(allowedKeyCodes[e.keyCode]);
    } else if (e.key != undefined) {
        if (allowedKeys.indexOf(e.key) != -1) { //e.key works in firefox but breaks chrome
            switch (e.key) {
                case 'Left': // | 'j':
                    player.handleInput('left'); //e.keyCode
                    break;
                case 'j':
                    player.handleInput('left'); //e.keyCode
                    break;
                case 'Right': // | 'l':
                    player.handleInput('right'); //e.keyCode
                    break;
                case 'l':
                    player.handleInput('right'); //e.keyCode
                    break;
                case 'Down': //| 'k':
                    player.handleInput('down'); //e.keyCode
                    break;
                case 'k':
                    player.handleInput('down'); //e.keyCode
                    break;
                case 'Up': // | 'i':
                    player.handleInput('up'); //e.keyCode
                    break;
                case 'i':
                    player.handleInput('up'); //e.keyCode
                    break;
            }
        }
    }
});

/** Listens for mouse clicks on the audio icon. */
//TODO update to listen for avatar selection, dependent on game state
document.addEventListener('click', function(e) {
    var myCanvas = document.querySelector('canvas');
    var mPos = getMousePos(myCanvas, e);
    if (gameStarted) {
        if (mPos.x >= myCanvas.width - 170 && mPos.x <= myCanvas.width - 132 && mPos.y >= 10 && mPos.y <= 48) {
            audioIcon.togglePlay();
        }
    } else {
        if (mPos.y >= 45 && mPos.y <= 113) { //if user selected an avatar, updates the avatar image with a rectangle
            if (mPos.x >= 50 && mPos.x < 151) {
                avatarIdx = 0;
            } else if (mPos.x >= 151 && mPos.x < 252) {
                avatarIdx = 1;
            } else if (mPos.x >= 252 && mPos.x < 353) {
                avatarIdx = 2;
            } else if (mPos.x >= 353 && mPos.x < 454) {
                avatarIdx = 3;
            }
            player.sprite = PLAYER_IMAGES[avatarIdx];
        } else if (mPos.x >= (CANVAS_DIMENSIONS[0] / 2 - 45) && mPos.x <= (CANVAS_DIMENSIONS[0] / 2 + 45) && mPos.y >= 175 && mPos.y <= 215) { //if user presses the Start button, updates the game state
            gameStarted = true;
        }
    }
});

/** Gets the mouse position relative to the canvas. Corrects for the white rectangle around the canvas.*/
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}