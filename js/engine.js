var Engine = (function(global) {
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        gameOverString = 'GAME OVER',
        patterns = {},
        //gameStarted = false, //tracks the game state
        //curPlayer = 0,
        lastTime,
        curCanvas;

    canvas.id = 'my_canvas';
    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);
    ctx.font = "400 30pt Nunito"; //lives, score

    function main() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (curGameState == gameStates[1]) { //game started and in play
            var now = Date.now(),
            dt = (now - lastTime) / 1000.0; //dt is about 0.016 b/c of the requestAnimationFrame() at end of main()
            update(dt);
            render();
            gameOverString = 'Game Over';
            lastTime = now;
        } else if (curGameState == gameStates[0]) { //game not started
            allAvatars.forEach(function(my_avatar) {
                my_avatar.update();
                my_avatar.render();
            });
            startBtn.render();
        } else if (curGameState == gameStates[2]) { //game over
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameOverText.update();
            gameOverText.render();
            replayBtn.render();
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
        timer.update(Date.now());
    }

    /**
     * Displays the avatars and Start button on the screen before the game begins.
     */
    // function showPlayer() {
    //     var players = [
    //             'images/char-boy.png',
    //             'images/char-cat-girl.png',
    //             'images/char-horn-girl.png',
    //             'images/char-princess-girl.png'
    //         ],
    //         playersRect = [
    //             'images/char-boy-rect.png',
    //             'images/char-cat-girl-rect.png',
    //             'images/char-horn-girl-rect.png',
    //             'images/char-princess-girl-rect.png'
    //         ],
    //         numPlayers = 4,
    //         btnString = 'Start',
    //         metrics = ctx.measureText(btnString),
    //         btnStringWidth,
    //         my_player;
    //     //console.log('btnStringHeight: ' + btnStringHeight);
    //     for (my_player = 0; my_player < numPlayers; my_player++) {
    //         if (my_player == curPlayer) {
    //             ctx.drawImage(Resources.get(playersRect[my_player]), 50 + my_player * 101, 0);
    //         } else {
    //             ctx.drawImage(Resources.get(players[my_player]), 50 + my_player * 101, 0);
    //         }
    //     }
    //     //draw button to start game
    //     btnStringWidth = metrics.width,
    //     ctx.fillStyle = '#00f';
    //     ctx.fillRect(canvas.width / 2 - 45, 175, 90, 40);
    //     //draw button text
    //     ctx.font = '16pt Arial';
    //     ctx.fillStyle = 'black';
    //     ctx.fillText(btnString, canvas.width / 2 - btnStringWidth / 2, 175 + 40 / 4 + 16);
    // }

    // function getPlayerChoice(e) {
    //     console.log('getPlayerChoice called');
    //     var canvasPosition = {
    //         x: curCanvas.offsetLeft,
    //         y: curCanvas.offsetTop
    //     };

    //     var mouse = {
    //         x: e.pageX - canvasPosition.x,
    //         y: e.pageY - canvasPosition.y
    //     };

    //     console.log('mouse.x:' + mouse.x);
    //     console.log('mouse.y:' + mouse.y);

    //     if (mouse.y >= 45 && mouse.y <= 113) { //if user selected an avatar, updates the avatar image with a rectangle
    //         if (mouse.x >= 50 && mouse.x < 151) {
    //             curPlayer = 0;
    //         } else if (mouse.x >= 151 && mouse.x < 252) {
    //             curPlayer = 1;
    //         } else if (mouse.x >= 252 && mouse.x < 353) {
    //             curPlayer = 2;
    //         } else if (mouse.x >= 353 && mouse.x < 454) {
    //             curPlayer = 3;
    //         }
    //         //showPlayer();
    //     } else if (mouse.x >= (canvas.width / 2 - 45) && mouse.x <= (canvas.width / 2 + 45) && mouse.y >= 175 && mouse.y <= 215) { //if user presses the Start button, updates the game state
    //         gameStarted = true;
    //         //main();
    //     }
    //     //updatePlayer();

    // }

    /**
     * Draws rectangle around the currently selected player. The boy is the default selection.
     */
    // function updatePlayer() {
    //     //maybe this should not be drawn from the engine
    //     //for case that player is not current player, probably want to draw white rectangles around those players first?

    //     ctx.rect(50 + curPlayer * 101, 45, 101, 113);
    //     ctx.lineWidth = 1;
    //     ctx.strokeStyle = 'red';
    //     ctx.stroke();
    // }

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
        timer.render();
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
        'images/char-boy-rect.png',
        'images/char-cat-girl.png',
        'images/char-cat-girl-rect.png',
        'images/char-horn-girl.png',
        'images/char-horn-girl-rect.png',
        'images/char-princess-girl.png',
        'images/char-princess-girl-rect.png',
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