//global vars
var CANVAS_DIMENSIONS = [505, 606];
var ENEMY_HEIGHTS = [63, 146, 229];
var ENEMY_IMAGE = ['images/enemy-bug-grn.png', 'images/enemy-bug-org.png', 'images/enemy-bug-prp.png'];
var PLAYER_IMAGE = 'images/char-cat-girl.png';
var PRIZE_IMAGE = ['images/Heart.png', 'images/Key.png', 'images/Star.png'];
var ENEMY_VELOCITY = [25, 90];
var PLAYER_START_LOC = [202, 405];
var PLAYER_MOVE = [101, 83];
var PRIZE_X = [0, 101, 202, 303, 404];
var PRIZE_Y = [72, 155, 238];
var score = 0;
var lives = 3;
var LIVES_TXT = 'Lives ' + lives;

//helper functions
function getRandomInt(min, max) { //note that max is non inclusive or resulting max becomes max - 1
    return Math.floor(Math.random() * (max - min)) + min;
}

function getStoneCell(x, y) {
//used to determine enemy-player collisions, where each stone is considered a cell in a grid
//if the player and enemy are in the same cell simultaneously, a collision will be detected in Player's update() funct
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
//superclass
var DynamicElement = function(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = '';
};

DynamicElement.prototype.render = function() {
    if (lives > 0) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

// (subclass) Enemies our player must avoid
var Enemy = function(x, y) {
    DynamicElement.call(this, x, y);
    this.sprite = ENEMY_IMAGE[getRandomInt(0, 3)];
    this.velocity = getRandomInt(ENEMY_VELOCITY[0], ENEMY_VELOCITY[1]);
};

Enemy.prototype = Object.create(DynamicElement.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
//why can't I access Engine.canvas.width
    if (this.x < CANVAS_DIMENSIONS[0] + 101) {
        this.x += this.velocity * dt;
    }
    if (this.x > CANVAS_DIMENSIONS[0]) {
        this.reset();
    }
}

Enemy.prototype.reset = function() {
    this.x = 0;
    this.y = ENEMY_HEIGHTS[getRandomInt(0, 3)];
    this.velocity = getRandomInt(ENEMY_VELOCITY[0], ENEMY_VELOCITY[1]);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
//subclass
var Player = function(x, y) {
    DynamicElement.call(this, x, y);
    this.sprite = PLAYER_IMAGE;
};

Player.prototype = Object.create(DynamicElement.prototype);
Player.prototype.constructor = Player;

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
}

Player.prototype.update = function() {
    var playerStoneCell = [];
    var enemyStoneCell = [];
    var prizeStoneCell = [];

    if (this.y < 63) { //check if player falls into water
        this.reset();
        lives -= 1;
    }
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

Player.prototype.reset = function() {
    this.x = PLAYER_START_LOC[0];
    this.y = PLAYER_START_LOC[1];
};

//subclass
var Prize = function(x, y) {
    DynamicElement.call(this, x, y);
    this.sprite = PRIZE_IMAGE[getRandomInt(0, 3)];
};
Prize.prototype = Object.create(DynamicElement.prototype);
Prize.prototype.constructor = Prize;

Prize.prototype.reset = function() {
    this.x = PRIZE_X[getRandomInt(0, 5)];
    this.y = PRIZE_Y[getRandomInt(0, 3)];;
    this.sprite = PRIZE_IMAGE[getRandomInt(0, 3)];
};

var Text = function(str, num) { //text to render lives and score
    this.str = str;
    this.displayStr = this.str + ' ' + num.toString();
};

Text.prototype.update = function(curCount) { //not completely sure why this was necessary but otherwise lives count would not update onscreen
    this.displayStr = this.str + ' ' + curCount.toString();
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// ??Place the player object in a variable called player
var player = new Player(PLAYER_START_LOC[0], PLAYER_START_LOC[1]);
var allEnemies = [];

for (var j = 0; j < 5; j++) { //MAX_ENEMIES
    var enemy = new Enemy(0, ENEMY_HEIGHTS[getRandomInt(0, 3)]);
    allEnemies.push(enemy);
}

var prize = new Prize(303, 155);
var livesText = new Text('Lives', lives);
var scoreText = new Text('Score', score);
scoreText.render = function() {
    var metrics = ctx.measureText(this.displayStr);
    ctx.clearRect(0, 0, metrics.width, 43);
    ctx.fillText(this.displayStr, 0, 40);
};

livesText.render = function() {
    var metrics = ctx.measureText(this.displayStr); //defined separate from Text class to align Lives to the right
    ctx.clearRect(CANVAS_DIMENSIONS[0] - metrics.width, 0, metrics.width, 43);
    ctx.fillText(this.displayStr, CANVAS_DIMENSIONS[0] - metrics.width, 40);
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
