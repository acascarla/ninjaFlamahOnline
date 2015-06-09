var AudioManager = function() {
	var mSounds = null;

    // Public
    this.playSound = function(soundName, loop){
    	mSounds[soundName].play('',0,3,loop,true);
    };
    this.stopSound = function(soundName){
    	mSounds[soundName].stop();
    };
    
    // Constructor
    (function() {
    	mSounds = new Array();
       	mSounds['menuMelody'] = phaser.add.audio('menuMelody');
		mSounds['bell'] = phaser.add.audio('bell');
		mSounds['jump'] = phaser.add.audio('jump');
		mSounds['katanaAir'] = phaser.add.audio('katanaAir');
		mSounds['katanaHit'] = phaser.add.audio('katanaHit');
		mSounds['die'] = phaser.add.audio('die');
		mSounds['playMelody'] = phaser.add.audio('playMelody');	
		mSounds['button'] = phaser.add.audio('button');	
		mSounds['steps'] = phaser.add.audio('steps');	
		mSounds['katanaPrepare'] = phaser.add.audio('katanaPrepare');	
		mSounds['winner'] = phaser.add.audio('winner');	
		mSounds['loser'] = phaser.add.audio('loser');	
		mSounds['fight'] = phaser.add.audio('fight');	
    })();
};



    	