//global vars
var CANVAS_DIMENSIONS = [505, 606];
var ENEMY_HEIGHTS = [63, 146, 229];
var ENEMY_VELOCITY = 50;
var ENEMY_IMAGE = 'images/enemy-bug.png';
var PLAYER_IMAGE = 'images/char-cat-girl.png';
var PLAYER_START_LOC = [202, 405];
var PLAYER_MOVE = [101, 83];

//helper functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getStoneCell(x, y) {
//used to determine enemy-player collisions, where each stone is considered a cell in a grid
//if the player and enemy are in the same cell simultaneously, 
    var stoneCell = [];
    var cellx = -1;
    var celly = -1;
    if (x >= 0 && x < CANVAS_DIMENSIONS[0] && y >= 63 && y <=249) {
        cellx = Math.floor(x / 101);
        celly = Math.floor(y / 83);
    }
    stoneCell[0] = cellx;
    stoneCell[1] = celly;

    return stoneCell;
}


//classes

// Enemies our player must avoid
var Enemy = function(x, y) { //(0, ENEMY_HEIGHTS[getRandomInt(0, 3)])
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.x = x;
    this.y = y;
    this.sprite = ENEMY_IMAGE;

};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
//why can't I access Engine.canvas.width
    if (this.x < CANVAS_DIMENSIONS[0] + 101) {
        this.x += ENEMY_VELOCITY * dt;
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//TODO
Enemy.prototype.reset = function() {
    console.log('implement reset')
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
// TODO try implement as pseudo classical constructor
//constructor for Player is messed up

var Player = function(x, y) {
    Enemy.call(this, x, y);
//    this.sprite = PLAYER_IMAGE;
};
//Player.sprite = PLAYER_IMAGE;

Player.prototype = Object.create(Enemy.prototype);
Player.prototype.constructor = Player;

//var Player = function(x, y) {
//    Enemy.call(this, x, y);
//    Enemy.sprite = PLAYER_IMAGE;
//};
//Player.prototype = Object.create(Enemy.prototype);

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
    }
    //check for collision with bug
    //TODO - collision not detected when player and bug are in the bottom row of stones
    //console.log('player.x: ' + this.x);
    //console.log('player.y: ' + this.y);
    playerStoneCell = getStoneCell(this.x, this.y);
    //console.log('playerStoneCell: ' + playerStoneCell);
    for (var i=0; i < allEnemies.length; i++) {
        enemyStoneCell = getStoneCell(allEnemies[i].x, allEnemies[i].y);
        //console.log('enemyStoneCell: ' + enemyStoneCell);
        if (playerStoneCell[0] == enemyStoneCell[0] && playerStoneCell[1] == enemyStoneCell[1] && enemyStoneCell[0] >= 0 && enemyStoneCell[1] >=0) {
            this.reset();
            //console.log('reset from StoneCell overlap');
        }
    }
};

Player.prototype.reset = function() {
    this.x = PLAYER_START_LOC[0];
    this.y = PLAYER_START_LOC[1];
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// ??Place the player object in a variable called player
var allEnemies = [];
var enemy1 = new Enemy(0, ENEMY_HEIGHTS[getRandomInt(0, 3)]);
//var enemy2 = new Enemy();
allEnemies.push(enemy1);
//allEnemies.push(enemy2);
var player = new Player(PLAYER_START_LOC[0], PLAYER_START_LOC[1]);
player.sprite = PLAYER_IMAGE;
//console.log(player.sprite);
//console.log(player.x);
//console.log(player.y);

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
