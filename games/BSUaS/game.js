Game.prototype = new PIXI.DisplayObjectContainer();
Game.prototype.constructor = Game;

function Game() {
    PIXI.DisplayObjectContainer.call(this);
    this.interactive = true;
    this.scale.x = this.scale.y = 2;
}

Game.prototype.initialize = function () {
    this.yo = PIXI.Sprite.fromImage(resourcePath + "images/yo.png");
    this.no = PIXI.Sprite.fromImage(resourcePath + "images/no.png");
    this.yes = PIXI.Sprite.fromImage(resourcePath + "images/yes.png");
    this.buzzerbeater = PIXI.Sprite.fromImage(resourcePath + "images/buzzerbeater.png");

    this.court = PIXI.Sprite.fromImage(resourcePath + "sprites/court.png");
    this.buzzer = PIXI.Sprite.fromImage(resourcePath + "sprites/buzzer.png");
    this.buzzer.x = 276;
    this.shotClockText = new PIXI.Text("14", { font: "bold 15px Arial", fill: "red" });
    this.shotClockText.x = 287;
    this.shotClockText.y = 8;
    this.basket = PIXI.Sprite.fromImage(resourcePath + "sprites/basket.png");
    this.basket.x = 269;
    this.basket.y = 92;

    this.ball = PIXI.Sprite.fromImage(resourcePath + "sprites/bball.png");
    this.ball.anchor.x = 0.5;
    this.ball.anchor.y = 0.5;

    this.indicatoryou = PIXI.Sprite.fromImage(resourcePath + "sprites/indicatoryou.png");
    this.indicatoryou.anchor.x = 0.5;
    this.indicatoryou.anchor.y = 0.5;
    this.indicatorbarkley = PIXI.Sprite.fromImage(resourcePath + "sprites/indicatorbarkley.png");
    this.indicatorbarkley.anchor.x = 0.5;
    this.indicatorbarkley.anchor.y = 0.5;

    this.suns = [PIXI.Sprite.fromImage(resourcePath + "sprites/sunsplayer.png"),
            PIXI.Sprite.fromImage(resourcePath + "sprites/sunsplayer.png"),
            PIXI.Sprite.fromImage(resourcePath + "sprites/sunsplayer.png"),
            PIXI.Sprite.fromImage(resourcePath + "sprites/sunsplayer.png"),
            PIXI.Sprite.fromImage(resourcePath + "sprites/sunsplayer.png")];

    this.sunsScreen = PIXI.Sprite.fromImage(resourcePath + "sprites/sunsplayerscreen.png");
    this.sunsScreen.anchor.x = 0.5;
    this.sunsScreen.anchor.y = 0.5;

    this.bulls = [PIXI.Sprite.fromImage(resourcePath + "sprites/bullsplayer.png"),
            PIXI.Sprite.fromImage(resourcePath + "sprites/bullsplayer.png"),
            PIXI.Sprite.fromImage(resourcePath + "sprites/bullsplayer.png"),
            PIXI.Sprite.fromImage(resourcePath + "sprites/bullsplayer.png"),
            PIXI.Sprite.fromImage(resourcePath + "sprites/bullsplayer.png")];

    this.title = PIXI.Sprite.fromImage(resourcePath + "sprites/bsuas.png");
    this.title.x = 15;

    this.instructions = PIXI.Sprite.fromImage(resourcePath + "images/instructions.png");

    this.addChild(this.court);
    this.addChild(this.shotClockText);

    this.suns.forEach(function (element, index, array) {
        element.anchor.x = 0.5;
        element.anchor.y = 0.5;
        element.team = 0;
        game.addChild(element);
    });

    this.bulls.forEach(function (element, index, array) {
        element.anchor.x = 0.5;
        element.anchor.y = 0.5;
        element.team = 1;
        game.addChild(element);
    });

    this.addChild(this.indicatoryou);
    this.addChild(this.indicatorbarkley);

    this.addChild(this.basket);
    this.addChild(this.ball);
    this.addChild(this.title);
    this.addChild(this.instructions);

    this.gameNumber = 0;
    this.gameState = 0;
    game.setUpGame();
    game.setDefenders();
}

Game.prototype.setUpGame = function () {
    this.moving = 2;
    this.blocking = false;
    this.ballState = 0;
    this.shotClock = 10;
    this.shotClockText.x = 287;
    this.shotClockText.setText(game.shotClock);
    this.gameNumber++;

    this.ball.arrived = true;

    this.suns.forEach(function (element, index, array) {
        element.arrived = true;
    });

    this.bulls.forEach(function (element, index, array) {
        element.arrived = true;
        element.blocked = 0;
    });

    this.suns[0].x = 20;
    this.suns[0].y = 150;
    this.ball.x = 14;
    this.ball.y = 150;
    this.bulls[0].x = 60;
    this.bulls[0].y = 100;
    this.bulls[0].scale.x = -1;

    this.suns[1].x = 50;
    this.suns[1].y = 80;
    this.suns[1].scale.x = -1;
    this.bulls[1].x = 30;
    this.bulls[1].y = 80;
    

    this.suns[2].x = 50;
    this.suns[2].y = 180;
    this.bulls[2].x = 30;
    this.bulls[2].y = 180;
    

    this.suns[3].x = 200;
    this.suns[3].y = 70;
    this.suns[3].scale.x = -1;
    this.bulls[3].x = 180;
    this.bulls[3].y = 80;
    

    this.suns[4].x = 190;
    this.suns[4].y = 190;
    this.suns[4].scale.x = -1;
    this.bulls[4].x = 160;
    this.bulls[4].y = 180;
}

Game.prototype.setDefenders = function () {
    this.bullsDefendPlayer(this.bulls[1], this.suns[1]);
    this.bullsDefendPlayer(this.bulls[2], this.suns[2]);
    this.bullsDefendPlayer(this.bulls[3], this.suns[3]);
    this.bullsDefendPlayer(this.bulls[4], this.suns[4]);
}

Game.prototype.run = function () {
    InputManager.padUpdate();

    if (game.gameState == 0) {
        if (InputManager.padPressed & InputManager.PAD.OK) {
            game.gameState = 1;
            game.slideUpTitle();
        }
    }
    else if (game.gameState == 1) {
        if (game.title.y < -180) {
            game.gameState = 2;
            game.addChild(game.yo);
        }
    }
    else if (game.gameState == 2) {
        if (InputManager.padPressed & InputManager.PAD.OK) {
            game.removeChild(game.yo);
            game.gameState = 3;
            game.setUpGame();
            AudioManager.play("whistle");
            AudioManager.loop("ambience");
            setTimeout(game.shotClockCountdown, 1000, game.gameNumber);
        }
    }
    else if (game.gameState == 3) {

        if (!game.blocking) {
            if (InputManager.padState & InputManager.PAD.UP) {
                game.suns[2].y--;
            }
            else if (InputManager.padState & InputManager.PAD.DOWN) {
                game.suns[2].y++;
            }

            if (InputManager.padState & InputManager.PAD.LEFT) {
                game.suns[2].x--;
                game.suns[2].scale.x = -1;
            }
            else if (InputManager.padState & InputManager.PAD.RIGHT) {
                game.suns[2].x++;
                game.suns[2].scale.x = 1;
            }

            game.indicatoryou.x = game.suns[2].x;
            game.indicatoryou.y = game.suns[2].y - 17;

            if (InputManager.padPressed & InputManager.PAD.OK) {
                game.blocking = true;
                game.moving = 10;
                game.sunsScreen.x = game.suns[2].x;
                game.sunsScreen.y = game.suns[2].y;
                game.sunsScreen.scale = game.suns[2].scale;
                game.removeChild(game.suns[2]);
                game.addChild(game.sunsScreen);
            }
        }
        if(game.blocking) {
            game.moving--;
            if (game.moving < -50) {
                game.removeChild(game.sunsScreen);
                game.addChild(game.suns[2]);
                game.blocking = false;
            }
        }

        if (InputManager.padPressed & InputManager.PAD.CANCEL && game.ballState == 0) {
            game.ballState = 1;
            game.suns[1].arrived = true;
            game.passToBarkley();
        }

        if(game.ballState == 0){
            game.moveBarkley();
        }

        if (game.ballState > 1) {
            if (game.ballState < 10) {
                game.ballState++;
                game.suns[1].scale.x = 1;
            }
            else {
                game.shootBall();
            }
        }

        if(game.ballState < 0) {
            game.ballState--;
            if (game.ballState < -50) {
                game.addChild(game.no);
                game.gameState = 4;
                AudioManager.play("boo");
            }
        }

        if (game.shotClock == 0) {
            game.shotClock = -1;
            AudioManager.play("buzzer");
            AudioManager.stopLoop("ambience");
            game.addChild(game.buzzer);
            if (game.ballState < 10) {
                game.ballState = -1;
            }
        }

        game.moveFirstDefenseUpAndDown();
        game.moveExtraSunsUpAndDown();
        game.fixDrawOrder();
    }
    else if (game.gameState > 3) {
        if (InputManager.padPressed & InputManager.PAD.OK) {
            if (game.blocking) {
                game.removeChild(game.sunsScreen);
                game.addChild(game.suns[2]);
                game.blocking = false;
            }
            game.gameState = 0;
            game.slideDownTitle();
            game.removeChild(game.no);
            game.removeChild(game.yes);
            game.removeChild(game.buzzerbeater);
            game.removeChild(game.title);
            game.removeChild(game.buzzer);
            game.addChild(game.title);
        }
    }

    setTimeout(game.run, 20);
}

Game.prototype.shotClockCountdown = function (gameNumber) {
    if (game.shotClock > 0 && game.gameNumber == gameNumber) {
        game.shotClock--;
        if (game.shotClock == 9) {
            game.shotClockText.x = 295;
        }
        game.shotClockText.setText(game.shotClock);
        setTimeout(game.shotClockCountdown, 1000, gameNumber);
    }
}

Game.prototype.passToBarkley = function(){
    var location = new PIXI.Point(game.suns[1].x - 6, game.suns[1].y);
    game.moveBall(game.ball, location, 10, true, game.ballState);
}

Game.prototype.shootBall = function () {
    if (game.ballState == 10) {
        game.ballState = 11;
        var location = new PIXI.Point(220, 70);
        game.moveBall(game.ball, location, 20, false, game.ballState);
    }
    else if (game.ballState == 11 && game.ball.arrived) {
        game.ballState = 12;
        var location = new PIXI.Point(250, 80);
        game.moveBall(game.ball, location, 20, false, game.ballState);
    }
    else if (game.ballState == 12 && game.ball.arrived) {
        game.ballState = 13;
        var location = new PIXI.Point(275, 122);
        game.moveBall(game.ball, location, 20, false, game.ballState);
    }
    else if (game.ballState == 13 && game.ball.arrived) {
        AudioManager.stopLoop("ambience");
        AudioManager.play("cheer");
        if (game.shotClock > 0) {
            game.addChild(game.yes);
        }
        else {
            game.addChild(game.buzzerbeater);
        }
        game.gameState = 5;
    }
}

Game.prototype.moveBall = function (ball, location, delay, interceptable, state) {
    if (game.ballState != state)
        return;

    ball.arrived = false;

    if (interceptable) {
        var notStolen = game.bulls.every(function (element, index, array) {
            if (Math.abs(element.x - game.ball.x) < 10 && Math.abs(element.y - game.ball.y) < 10) {
                element.blocked = 50;
                element.arrived = true;
                game.ball.x = element.x - 6;
                game.ball.y = element.y;
                return false;
            }
            return true;
        });

        if (!notStolen) {
            game.ballState = -1;
            AudioManager.stopLoop("ambience");
            AudioManager.play("whistle");
            ball.arrived = true;
            return;
        }

        if (Math.abs(game.suns[1].x - game.ball.x) < 10 && Math.abs(game.suns[1].y - game.ball.y) < 10) {
            game.ballState = 2;
            ball.arrived = true;
            return;
        }
    }

    var angle = Math.atan2(location.x - game.ball.x, location.y - game.ball.y);
    ball.x += Math.sin(angle) * 2;
    ball.y += Math.cos(angle) * 2;

    if (!interceptable && Math.abs(ball.x - location.x) < 2 && Math.abs(ball.y - location.y) < 2) {
        ball.arrived = true;
    }
    else {
        setTimeout(game.moveBall, delay, ball, location, delay, interceptable, state);
    }
}

Game.prototype.bullsDefendPlayer = function (bull, sun) {
    if (game.gameState == 3) {
        if (bull.arrived && bull.blocked == 0) {
            game.movePlayer(bull, new PIXI.Point(sun.x - 20, sun.y), 15);
        }
        else if (bull.blocked > 0) {
            bull.blocked--;
        }
        else {
            bull.scale.x = Math.random() > .5 ? -1 : 1;
        }
    }
    setTimeout(game.bullsDefendPlayer, Math.random() * 50 + 150, bull, sun);
}

Game.prototype.moveBarkley = function () {
    if (game.suns[1].arrived) {
        var location = new PIXI.Point();
        location.x = 130 + Math.round(Math.random() * 70);
        location.y = 60 + Math.round(Math.random() * 150);
        game.movePlayer(game.suns[1], location, 20);
    }
}

Game.prototype.moveFirstDefenseUpAndDown = function () {
    if (game.bulls[0].arrived) {
        var location = new PIXI.Point();
        if (game.bulls[0].y > 100) {
            location.x = 60;
            location.y = 100;
            game.movePlayer(game.bulls[0], location, 30);
        }
        else {
            location.x = 60;
            location.y = 200;
            game.movePlayer(game.bulls[0], location, 30);
        }
    }
}

Game.prototype.moveExtraSunsUpAndDown = function()
{
    if (game.suns[3].arrived) {
        var location = new PIXI.Point();
        if (game.suns[3].y < 70) {
            location.x = 270;
            location.y = 80;
            game.movePlayer(game.suns[3], location, 20);
        }
        else {
            location.x = 270;
            location.y = 60;
            game.movePlayer(game.suns[3], location, 20);
        }
    }

    if (game.suns[4].arrived) {
        var location = new PIXI.Point();
        if (game.suns[4].y < 190) {
            location.x = 260;
            location.y = 200;
            game.movePlayer(game.suns[4], location, 20);
        }
        else {
            location.x = 260;
            location.y = 180;
            game.movePlayer(game.suns[4], location, 20);
        }
    }
}

Game.prototype.movePlayer = function (player, location, delay) {
    player.arrived = false;
    game.movePlayerCallback(player, location, delay);
}

Game.prototype.movePlayerCallback = function (player, location, delay) {
    if (player.arrived)
        return;

    var arrivedX = false;
    var arrivedY = false;

    if (player.team = 1 && game.blocking && game.moving > -20 && Math.abs(game.suns[2].x - player.x) < 10 && Math.abs(game.suns[2].y - player.y) < 5) {
        player.arrived = true;
        player.blocked = 5;
        return;
    }        

    if (player.x < location.x) {
        player.x++;
    }
    else if (player.x > location.x) {
        player.x--;
    }
    else {
        arrivedX = true;
    }

    if (player.y < location.y) {
        player.y++;
    }
    else if (player.y > location.y) {
        player.y--;
    }
    else {
        arrivedY = true;
    }

    if (player == game.suns[1]) {
        game.indicatorbarkley.x = player.x;
        game.indicatorbarkley.y = player.y - 17;
    }

    if(!arrivedX || !arrivedY) {
        setTimeout(game.movePlayerCallback, delay, player, location, delay);
    }
    else {
        player.arrived = true;
    }
}

Game.prototype.fixDrawOrder = function () {
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            if(i != j)
                game.fixDrawOrderPlayers(game.suns[i], game.suns[j]);
        }
    }
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            if (i != j)
                game.fixDrawOrderPlayers(game.bulls[i], game.bulls[j]);
        }
    }
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            game.fixDrawOrderPlayers(game.suns[i], game.bulls[j]);
        }
    }
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            game.fixDrawOrderPlayers(game.bulls[i], game.suns[j]);
        }
    }

    if (game.blocking) {
        for (var i = 0; i < 5; i++) {
            game.fixDrawOrderPlayers(game.bulls[i], game.sunsScreen);
        }
    }
}

Game.prototype.fixDrawOrderPlayers = function (player1, player2) {
    if (game.blocking && (game.suns[2] == player1 || game.suns[2] == player2)) {
        return;
    }

    if (player1.y > player2.y && game.getChildIndex(player1) < game.getChildIndex(player2)) {
        game.swapChildren(player1, player2);
    }
}

Game.prototype.slideUpTitle = function () {
    if (game.title.y > -200 && game.gameState != 0) {
        game.title.y -= 5;
        setTimeout(game.slideUpTitle, 10);
    }
}

Game.prototype.slideDownTitle = function () {
    if (game.title.y < 0 && game.gameState == 0) {
        game.title.y += 5;
        setTimeout(game.slideDownTitle, 10);
    }
}