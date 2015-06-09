var ninjaFlamah = null;
var playState = {
    create: function() { 
    	ninjaFlamah = new NinjaFlamah();
    	phaser.audioManager.playSound('playMelody',0,1,false);
	},

	update: function() {
		if(ninjaFlamah) {
            ninjaFlamah.update();   
        }
	},

};