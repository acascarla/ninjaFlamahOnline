
var menuState = {
    create: function() { 

    	phaser.add.tileSprite(0, 0, 800, 600, 'background');
		var title = phaser.add.sprite(phaser.world.centerX-265, phaser.world.centerY-150, 'title');
    	var buttonPlay = phaser.add.button(phaser.world.centerX-98, phaser.world.centerY-28, 'playButton', playButtonClick, this);
    	buttonPlay.scale.setTo(1.4,1.4);

	},

};

this.playButtonClick = function() {
		phaser.state.start('play');
	};