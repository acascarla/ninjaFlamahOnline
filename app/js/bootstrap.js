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
            phaser.load.spritesheet('dude', 'assets/dude.png', 32, 48);
            phaser.load.spritesheet('player', 'assets/sprite/player.png', 60, 65);
            phaser.load.image('red', 'assets/red.png');
            phaser.load.image('green', 'assets/green.png');
            phaser.load.image('heart', 'assets/heart.png');
            phaser.load.image('skull', 'assets/skull.png');
            phaser.load.image('playButton', 'assets/buttons/playButton.png');
            phaser.load.image('replayButton', 'assets/buttons/replayButton.png');
            phaser.load.image('backButton', 'assets/buttons/backButton.png');
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
