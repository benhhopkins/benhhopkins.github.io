var stage = null;
var renderer = null;
var renderWidth = 700;
var renderHeight = 600;

var game = null;
var music = null;
var resourcePath = "";

function Main(path) {
    resourcePath = path;

    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

    canvas = document.getElementById("screen");
    InputManager.connect(document, canvas);
    InputManager.reset();

    stage = new PIXI.Stage(0x888888);
    renderer = PIXI.autoDetectRenderer(renderWidth, renderHeight, null, false, false);

    var loadSprites = [resourcePath + "sprites/court.png",
                        resourcePath + "sprites/basket.png",
                        resourcePath + "sprites/bullsplayer.png",
                        resourcePath + "sprites/sunsplayer.png",
                        resourcePath + "sprites/sunsplayerscreen.png",
                        resourcePath + "sprites/bball.png",
                        resourcePath + "sprites/buzzer.png",
                        resourcePath + "sprites/indicatoryou.png",
                        resourcePath + "sprites/indicatorbarkley.png",
                        resourcePath + "sprites/bsuas.png",
                        resourcePath + "images/no.png",
                        resourcePath + "images/yes.png",
                        resourcePath + "images/yo.png",
                        resourcePath + "images/buzzerbeater.png",
                        resourcePath + "images/instructions.png"];
    var loader = new PIXI.AssetLoader(loadSprites);
    loader.onComplete = loadSounds;
    loader.load();

    return renderer.view;
}

function loadSounds() {
    AudioManager.load({
        'whistle': 'sounds/whistle',
        'buzzer': 'sounds/buzzer',
        'cheer': 'sounds/cheer',
        'boo': 'sounds/boo',
        'ambience': 'sounds/ambience'
    }, onLoaded);

    music = new Audio("sounds/roundball.mp3");
    music.volume = 0.5;
    music.play();
    music.loop = true;
}

function onLoaded() {
    game = new Game();
    game.initialize();
    stage.addChild(game);

    requestAnimFrame(animate);

    game.run();
}

function animate() {
  requestAnimFrame(animate);
  renderer.render(stage);
}
