var Player = function(worldReference) {
    var socket = io();
    var mSprite = null;
    var mWorldReference = worldReference;
    var wasd = null;
    var space = null;
    var mReadyState = false;
    var mId = null;
    var mGameStarted = false;
    var mCanUpdate = false;

    
    // Public
    this.update = function() {
        if (mCanUpdate && mId != null && mId != 'spectator'){
            //1. Recoger los inputs
            playerMovement();
            //2. Mandar inputs, recoger la información del servidor y actualizar lo que vemos
            mWorldReference.updateThisWorld();
            //3. Control de si el juego ha empezado o no
            mGameStarted = mWorldReference.getGameStarted();

            // Interface update quan comença el joc
            if (mGameStarted){
                mWorldReference.removeReadySprites();
                mReadyState=false;
            }
        }
    };

    // Private
    var playerMovement = function() {
        // Left
        if (wasd.left.isDown){
            // ----->> SOCKET CHANGE <<-------
            mWorldReference.onPressLeft(true);
        }else if(!wasd.left.isDown){
            // ----->> SOCKET CHANGE <<-------
            mWorldReference.onPressLeft(false);
        }
        // Right
        if (wasd.right.isDown){
            // ----->> SOCKET CHANGE <<-------
            mWorldReference.onPressRight(true);
        }
        else if (!wasd.right.isDown)
        {
            // ----->> SOCKET CHANGE <<-------
            mWorldReference.onPressRight(false);
        }
        // Up
        if (wasd.up.isDown)
        {
            // ----->> SOCKET CHANGE <<-------
            mWorldReference.onPressUp(true);
        }else if (!wasd.up.isDown)
        {
            // ----->> SOCKET CHANGE <<-------
            mWorldReference.onPressUp(false);
        }
    };

   
    
    var changeReadyStateOrAttack = function(){
        if(!mGameStarted){ // Si no ha començat el joc faig el canvi del ready state
            if (mReadyState){
            mReadyState = false;
            }else{
                mReadyState = true;
            }
            // ----->> SOCKET CHANGE <<-------
            mWorldReference.changeReadyState(mReadyState);
        }else{ // Si ja ha començat: la mateixa tecla serveix per atacar
            // ----->> SOCKET CHANGE <<-------
            mWorldReference.attack();
        }
    };


    
    // Constructor
    (function() {
        console.log("create player");
        wasd = {
            up: phaser.input.keyboard.addKey(Phaser.Keyboard.W),
            left: phaser.input.keyboard.addKey(Phaser.Keyboard.A),
            right: phaser.input.keyboard.addKey(Phaser.Keyboard.D)
        };
        space = phaser.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space.onDown.add(changeReadyStateOrAttack, this);

        // SOCKET LISTENERS
        //1. ID Creation
        socket.on ('idCreated', function (data) {
            if (mId == null){
                mId = data;
                //1. Informar al cliente que ya puede funcionar.
                mCanUpdate = true;
                //2. Instanciar el objeto de player en el World con el ID del server
                mWorldReference.instantiatePlayer(mId);
            }
        });
        //1. GET PLAYERS FROM SERVER
        socket.on ('updatePlayersInClient', function (players) {
            mWorldReference.updatePlayersInClient(players);
        });

    })();
};