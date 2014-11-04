//global vars
var CANVAS_DIMENSIONS = [505, 606];
var ENEMY_HEIGHTS = [63, 146, 229];
//var ENEMY_VELOCITY = 50;//[20, 75] ... might want to make an array indicating min and max velocity
var ENEMY_IMAGE = ['images/enemy-bug-grn.png', 'images/enemy-bug-org.png', 'images/enemy-bug-prp.png'];
var PLAYER_IMAGE = 'images/char-cat-girl.png';
var PRIZE_IMAGE = ['images/Heart.png', 'images/Key.png', 'images/Star.png'];
var PLAYER_START_LOC = [202, 405];
var PLAYER_MOVE = [101, 83];
//var MAX_ENEMIES = 8;
//var score = 0; //want to add points for prizes
var lives = 3; //want to subtract lives when collide with bugs
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

//might want to think about function that tracks number of active enemies
//should probably also spawn additional enemies if below the max allowed num enemies

//common aspects among all objects (enemies, player, prizes)
//position x and y values
//sprite url
//render function
//they would each have unique update and reset functions

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
    this.velocity = getRandomInt(25, 76);
};

Enemy.prototype = Object.create(DynamicElement.prototype);
Enemy.prototype.constructor = Enemy;


//var Enemy = function(x, y) { //(0, ENEMY_HEIGHTS[getRandomInt(0, 3)])
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
//    var velocity = getRandomInt(25, 76);
    //console.log('velocity: ' + velocity);
//    this.x = x;
//    this.y = y;
//    this.sprite = ENEMY_IMAGE[getRandomInt(0, 3)];
//    this.velocity = velocity;
//};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
//why can't I access Engine.canvas.width
    if (this.x < CANVAS_DIMENSIONS[0] + 101) {
        this.x += this.velocity * dt; //ENEMY_VELOCITY 
    }
    if (this.x > CANVAS_DIMENSIONS[0]) {
        this.reset();
    }
}

// Draw the enemy on the screen, required method for game
//Enemy.prototype.render = function() {
//    if (lives > 0) {
//        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
//    }
//}

Enemy.prototype.reset = function() {
    this.x = 0;
    this.y = ENEMY_HEIGHTS[getRandomInt(0, 3)];
    this.velocity = getRandomInt(25, 76);
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

var Text = function() { //text to render like lives and score
    this.render = function() {
        var metrics = ctx.measureText(LIVES_TXT); //LIVES_TXT might need to be a param for the constructor
        ctx.clearRect(CANVAS_DIMENSIONS[0] - metrics.width, 0, metrics.width, 43);
        ctx.fillText(LIVES_TXT, CANVAS_DIMENSIONS[0] - metrics.width, 40);
    }
    this.update = function() { //not completely sure why this was necessary but otherwise lives count would not update onscreen
        var curLives = lives;
        LIVES_TXT = 'Lives ' + curLives;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// ??Place the player object in a variable called player
var player = new Player(PLAYER_START_LOC[0], PLAYER_START_LOC[1]);
var allEnemies = [];

for (var j = 0; j < 4; j++) { //MAX_ENEMIES
    var enemy = new Enemy(0, ENEMY_HEIGHTS[getRandomInt(0, 3)]);
    allEnemies.push(enemy);
}

var prize = new Prize(303, 155);

var livesText = new Text();

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
