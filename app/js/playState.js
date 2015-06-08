var ninjaFlamah = null;
var playState = {
    create: function() { 
    	ninjaFlamah = new NinjaFlamah();
	},

	update: function() {
		if(ninjaFlamah) {
            ninjaFlamah.update();   
        }
	},

};