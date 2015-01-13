var Engine = (function(global) {
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        patterns = {},
        gameStarted = false,
        curPlayer = 0,
        lastTime,
        curCanvas;

    canvas.id = 'my_canvas';
    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);
    ctx.font = "30pt Arial"; //lives, score

    function main() {
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        if (!gameStarted) {
            curCanvas = document.querySelector('#my_canvas');
            curCanvas.addEventListener('click', getPlayerChoice, false);
            updatePlayer();
            showPlayer();
            console.log('do something');
        } else {
            update(dt);
            render();
            lastTime = now;
        }
        win.requestAnimationFrame(main);
    }

    function init() {
        //TODO add check for game state and display of screen to select the player
        //and start the game play
        reset(); //this is not actually being used
        lastTime = Date.now();
        main();
    }

    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.checkCollisions();
        player.update();
        audioIcon.update();
        scoreText.update(score);
        livesText.update(lives);
    }

    function showPlayer() {
        var players = [
                'images/char-boy.png',
                'images/char-cat-girl.png',
                'images/char-horn-girl.png',
                'images/char-princess-girl.png'
            ],
            numPlayers = 4
            player;
        for (player = 0; player < numPlayers; player++) {
            ctx.drawImage(Resources.get(players[player]), 50 + player * 101, 0);
        }
    }

    function getPlayerChoice(e) {
        console.log('getPlayerChoice called');
        var canvasPosition = {
            x: curCanvas.offsetLeft,
            y: curCanvas.offsetTop
        };

        var mouse = {
            x: e.pageX - canvasPosition.x,
            y: e.pageY - canvasPosition.y
        };

        console.log('mouse.x:' + mouse.x);
        console.log('mouse.y:' + mouse.y);

        if (mouse.y >= 45 && mouse.y <= 113) {
            if (mouse.x >= 50 && mouse.x < 151) {
                curPlayer = 0;
            } else if (mouse.x >= 151 && mouse.x < 252) {
                curPlayer = 1;
            } else if (mouse.x >= 252 && mouse.x < 353) {
                curPlayer = 2;
            } else if (mouse.x >= 353 && mouse.x < 454) {
                curPlayer = 3;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        //updatePlayer();

    }

    /**
     * Draws rectangle around the currently selected player. The boy is the default selection.
     */
    function updatePlayer() {
        //for case that player is not current player, probably want to draw white rectangles around those players first?

        ctx.rect(50 + curPlayer * 101, 45, 101, 113);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'red';
        ctx.stroke();
    }

    function render() {
        var rowImages = [
                'images/water-block.png',
                'images/stone-block.png',
                'images/stone-block.png',
                'images/stone-block.png',
                'images/grass-block.png',
                'images/grass-block.png'
            ],
            numRows = 6,
            numCols = 5,
            row, col,
            micPath = 'images/mic50x50.jpg';
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        renderEntities();
    }

    function renderEntities() {
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        player.render();
        prize.render();
        audioIcon.render();
        scoreText.render();
        livesText.render();
    }

    function reset() {
        // noop
    }

    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-princess-girl.png',
        'images/enemy-bug-grn.png',
        'images/enemy-bug-org.png',
        'images/enemy-bug-prp.png',
        'images/Heart.png',
        'images/Key.png',
        'images/Star.png',
        'images/mic50x50.jpg',
        'images/mic_grey.jpg'
    ]);
    Resources.onReady(init);

    global.ctx = ctx;
})(this);
