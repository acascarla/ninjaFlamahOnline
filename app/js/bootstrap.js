//var ninjaFlamah = null;
var phaser = new Phaser.Game(
    800, 
    600, 
    Phaser.AUTO, 
    '', 
    { 
        preload: function() {
            phaser.load.image('background', 'assets/background.jpg');
            phaser.load.image('title', 'assets/title.png');
            phaser.load.image('floor', 'assets/floor.png');
            phaser.load.image('block1', 'assets/singleBlock.png');
            phaser.load.image('block2', 'assets/doubleBlock.png');
            phaser.load.image('block4', 'assets/quadrupleBlock.png');
            phaser.load.image('block8', 'assets/octupleBlock.png');
            phaser.load.spritesheet('player', 'assets/sprite/player.png', 60, 65);
            phaser.load.spritesheet('player2', 'assets/sprite/player2.png', 60, 65);
            phaser.load.image('red', 'assets/red.png');
            phaser.load.image('green', 'assets/green.png');
            phaser.load.image('heart', 'assets/heart.png');
            phaser.load.image('skull', 'assets/skull.png');
            phaser.load.image('playButton', 'assets/buttons/playButton.png');
            phaser.load.image('replayButton', 'assets/buttons/replayButton.png');
            phaser.load.image('backButton', 'assets/buttons/backButton.png');
            phaser.load.image('youLose', 'assets/finalBanners/youLose.png');
            phaser.load.image('youWin', 'assets/finalBanners/youWin.png');

            // load audios
            phaser.load.audio('bell', 'assets/audio/bell.mp3');
            phaser.load.audio('button', 'assets/audio/button.mp3');
            phaser.load.audio('die', 'assets/audio/die.mp3');
            phaser.load.audio('jump', 'assets/audio/jump.mp3');
            phaser.load.audio('katanaAir', 'assets/audio/katanaAir.mp3');
            phaser.load.audio('katanaHit', 'assets/audio/katanaHit.mp3');
            phaser.load.audio('menuMelody', 'assets/audio/menuMelody.mp3');
            phaser.load.audio('playMelody', 'assets/audio/playMelody.mp3');
            phaser.load.audio('steps', 'assets/audio/steps.mp3');
            phaser.load.audio('katanaPrepare', 'assets/audio/katanaPrepare.mp3');
            phaser.load.audio('loser', 'assets/audio/loser.mp3');
            phaser.load.audio('winner', 'assets/audio/winner.mp3');
            phaser.load.audio('fight', 'assets/audio/fight.mp3');

            // globals
            phaser.audioManager = new AudioManager();
        }, 

        create: function() {
            //ninjaFlamah = new NinjaFlamah();
            phaser.state.start('menu');
        }, 
        update: function() {
            /*if(ninjaFlamah) {
                ninjaFlamah.update();   
            }*/
        }
    }
);


phaser.state.add('menu', menuState);
phaser.state.add('play', playState);
