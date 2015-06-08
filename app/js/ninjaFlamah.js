var NinjaFlamah = function() {
    var mWorld = null;
    var mPlayer = null;    
    
    this.update = function() {   
        mPlayer.update();
    };
    
    (function() {  
        mWorld = new World();  
        mPlayer = new Player(mWorld);
    })();
};