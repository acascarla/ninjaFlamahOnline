var World = function() {
    var socket = io();
    // Physics elements
    var mPlatforms = null;
    var mGround = null;
    var mLedges = [];    
    var mSprite = null;
    var mSpriteOtherPlayer = null;
    // Interface
    var mInterfaceElementsContainer = [];
    var mReadySprite = null;
    // Players
    var player = null; // This client player
    var otherPlayer = null;// Array with all other players
    //var mPlayerObjectOriginal = playerObject; // This is only the template to send info to server, without any sprite or unnecessary info
    var playerAux = null;
    var num = 1;

    //auxiliar
    var mCanRemoveReadySprites = true;
    var mMustResetInterface = true;
    var mCanPlayDieAnimation = true; // nomes pot morir 1 a la vegada, no hi ha double kill

    //semafors
    var mGameStarted = false;
    var mGameFinished = false;
    var mMustDrawFinishInterface = true;
    
    // Això agafa tota la info del server (recollida pel player i enviada aqui pel mateix) i actualitza tot el world (players, attacks, kills, etc)
    this.updateThisWorld = function(){
        phaser.physics.arcade.overlap(player.sprite, otherPlayer.sprite, onPlayerOverlap, null, this);

        
        player.sprite.body.velocity.x = 0;
        phaser.physics.arcade.collide(player.sprite, mPlatforms);

        if (otherPlayer.time == null) {
            otherPlayer.sprite.scale.setTo(0.0,0.0);
        } else {
            otherPlayer.sprite.scale.setTo(0.7,0.7);
        }

        if (!mGameFinished){
            // Play logic
            playerControl(); // Realizar movimientos oportunos 
            // Sync
            updatePlayerInServer(player); // Notificar al server de nuestros Movimientos - Esto automáticamente ya recoge la info del otro player, en el server se hace el emit del otro player y en el player hay un socket.on que lo recoge y se lo pasa al updatePlayersInClient de aqui
            // Paint other player
            updateOtherPlayerInClient();
            // Check for GameStart
            updateGameStart();
        }else{
            // Finish game
            finishGame();
        }

        if (!mGameStarted) updateReadyStates();
        updateInterface(); // TODO: quan tot funcioni ficar la linea de dalt dins de updateInterface

    };

    this.instantiatePlayer = function(mId){
       //create players sprites
       if (mId != 'spectator'){
            player.id = mId;
            createPlayerSprite();
            player.readyState = false;
            player.lifes = 3;
            player.kills = 0;
            player.isMovingRight = false;
            player.isMovingLeft = false;
            player.isMovingUp = false;
            player.attackStartedAt = null;
            player.killsInterfaceUpdated = 0;
            player.killsInterfaceUpdatedOtherClient = 0
            player.lifesInterfaceNextUpdate = 3;
            player.gameIsFinished = false;
            player.isAbleToMove = true;
            player.killedAt = null;
            player.resetGame = false;
            player.time = null;
            
            // Sprite config
            player.sprite = mSprite;
            phaser.physics.arcade.enable(player.sprite);
            player.sprite.position.y = 0;
            player.sprite.body.gravity.y = 3800;
            player.sprite.body.collideWorldBounds = true;
            player.sprite.justAttacked = false;

            if (mId == 'Player1'){
                player.isFacingRight = true;
                player.sprite.position.x = 60;
                mInterfaceElementsContainer[0].text.scale.setTo(0,0);
                mInterfaceElementsContainer[0].text = phaser.add.text(10, 0, 'Player 1:', { font: '22px Arial', fill: '#FF0' });
            }else if(mId == 'Player2'){
                player.isFacingRight = false;
                player.sprite.position.x = 740;
                mInterfaceElementsContainer[1].text.scale.setTo(0,0);
                mInterfaceElementsContainer[1].text = phaser.add.text(710, 0, 'Player 2:', { font: '22px Arial', fill: '#FF0' });
            }


            // Instantiate other player
            if (mId == 'Player1'){
                otherPlayer.id = 'Player2';
            }else if(mId == 'Player2'){
                otherPlayer.id = 'Player1';
            }
            createOtherPlayerSprite();
            otherPlayer.readyState = false;
            otherPlayer.lifes = 3;
            otherPlayer.kills = 0;
            otherPlayer.isMovingRight = false;
            otherPlayer.isMovingLeft = false;
            otherPlayer.isMovingUp = false;
            otherPlayer.attackStartedAt = null;
            otherPlayer.killsInterfaceUpdated = 0;
            otherPlayer.killsInterfaceUpdatedOtherClient = 0
            otherPlayer.lifesInterfaceNextUpdate = 3;
            otherPlayer.gameIsFinished = false;
            otherPlayer.isAbleToMove = true;
            otherPlayer.killedAt = null;
            otherPlayer.resetGame = false;
            otherPlayer.isFacingRight = true;
            otherPlayer.time = null;
            
            // Sprite config
            otherPlayer.sprite = mSpriteOtherPlayer;
            phaser.physics.arcade.enable(otherPlayer.sprite);
            otherPlayer.sprite.position.x = -200;
            otherPlayer.sprite.position.y = 0;
            //otherPlayer.sprite.body.gravity.y = 3800;
            otherPlayer.sprite.body.collideWorldBounds = true;
            otherPlayer.sprite.justAttacked = false;

            updatePlayerInServer(player);
       }
    };

    var updatePlayerInServer = function(player){
        var simplePlayer = parsePlayerForServer(player);
        socket.emit ('updatePlayerInServer', simplePlayer);
    };

    var parsePlayerForServer = function(player) {
        var playerToServer = new Object();
        playerToServer.id = player.id;
        playerToServer.readyState = player.readyState;
        playerToServer.lifes = player.lifes;
        playerToServer.kills = player.kills;
        playerToServer.isFacingRight = player.isFacingRight;
        playerToServer.isMovingRight = player.isMovingRight;
        playerToServer.isMovingLeft = player.isMovingLeft;
        playerToServer.isMovingUp = player.isMovingUp;
        playerToServer.attackStartedAt = player.attackStartedAt;
        playerToServer.killsInterfaceUpdated = player.killsInterfaceUpdated;
        playerToServer.killsInterfaceUpdatedOtherClient = player.killsInterfaceUpdatedOtherClient;
        playerToServer.lifesInterfaceNextUpdate = player.lifesInterfaceNextUpdate;
        playerToServer.gameIsFinished = player.gameIsFinished;
        playerToServer.isAbleToMove = player.isAbleToMove;
        playerToServer.killedAt = player.killedAt;
        playerToServer.resetGame = player.resetGame;
        playerToServer.x = player.sprite.position.x;
        playerToServer.y = player.sprite.position.y;
        playerToServer.justAttacked = player.sprite.justAttacked;
        playerToServer.time = player.time;

        return playerToServer;
    }


    this.updatePlayersInClient = function(serverPlayers){
        var i = 0;
        var me = 0;
        if (player.id == "Player1"){ 
            i = 1; // El otherPlayer viene en el serverPlayers[1]
            me = 0; // yo soy el 0
        }else if (player.id == "Player2"){
            i = 0; // El otherPlayer viene en el serverPlayers[1]
            me = 1; // yo soy el 1
        }
        // update other player here in client
        if (serverPlayers[i] != null){
            otherPlayer.id = serverPlayers[i].id;
            otherPlayer.readyState = serverPlayers[i].readyState;
            otherPlayer.lifes = serverPlayers[i].lifes;
            otherPlayer.kills = serverPlayers[i].kills;
            otherPlayer.isFacingRight = serverPlayers[i].isFacingRight;
            otherPlayer.isMovingRight = serverPlayers[i].isMovingRight;
            otherPlayer.isMovingLeft = serverPlayers[i].isMovingLeft;
            otherPlayer.isMovingUp = serverPlayers[i].isMovingUp;
            otherPlayer.attackStartedAt = serverPlayers[i].attackStartedAt;
            otherPlayer.killsInterfaceUpdated = serverPlayers[i].killsInterfaceUpdated;
            otherPlayer.killsInterfaceUpdatedOtherClient = serverPlayers[i].killsInterfaceUpdatedOtherClient;
            otherPlayer.lifesInterfaceNextUpdate = serverPlayers[i].lifesInterfaceNextUpdate;
            otherPlayer.gameIsFinished = serverPlayers[i].gameIsFinished;
            otherPlayer.isAbleToMove = serverPlayers[i].isAbleToMove;
            otherPlayer.killedAt = serverPlayers[i].killedAt;
            otherPlayer.resetGame = serverPlayers[i].resetGame;
            otherPlayer.time = serverPlayers[i].time;
            otherPlayer.sprite.position.x = serverPlayers[i].x;
            otherPlayer.sprite.position.y = serverPlayers[i].y;
            otherPlayer.sprite.justAttacked = serverPlayers[i].justAttacked;
        }else{
            otherPlayer.sprite.position.x = -200;
        }
        // update myself when needed
        if (serverPlayers[me] != null){
            if (serverPlayers[me].lifes < player.lifes){
                player.lifes = serverPlayers[me].lifes;
                player.killedAt = serverPlayers[me].killedAt;
                player.isAbleToMove = serverPlayers[me].isAbleToMove;
                player.gameIsFinished = serverPlayers[me].gameIsFinished;
                mGameFinished = player.gameIsFinished;
            }
            player.time = serverPlayers[me].time;
            player.killsInterfaceUpdatedOtherClient = serverPlayers[me].killsInterfaceUpdatedOtherClient;
        }
    };



    // Això es cridat pel player quan tots els players estan Ready, fa la transició d'interface a començament del joc
    this.removeReadySprites = function(){
        if (mCanRemoveReadySprites){
            phaser.audioManager.playSound('fight',0,4,false);
            mInterfaceElementsContainer.forEach(function(readyState) {
                phaser.add.tween(readyState.sprite.scale).to({x: 0, y:0}, 500).start();
                phaser.add.tween(readyState.sprite.position).to({x: 0, y:0}, 700).start();
                // TODO: Appear lifes and Score sprites
                mInterfaceElementsContainer.forEach(function(element){
                    element.lifes.forEach(function(life){
                        phaser.add.tween(life.scale).to({x: 1, y:1}, 400).start();
                    });
                });
            });
            mCanRemoveReadySprites = false;
        }
    };

    this.getClientPlayer = function(){
        return player;
    };

    this.getGameStarted = function(){
        return mGameStarted;
    };



    this.changeReadyState = function(readyState){
        if (!mGameStarted){
            phaser.audioManager.playSound('katanaPrepare');
            player.readyState = readyState;
        }
    };

    var updateGameStart = function(){
        if (player.readyState && otherPlayer.readyState) {
            mGameStarted = true;
        }
    };


    this.attack = function(){
        if (player.isAbleToMove && !mGameFinished){
            phaser.audioManager.playSound('katanaAir',0,1,true);
            if (player.isFacingRight){
                player.sprite.animations.play('attackRight');
                player.attackStartedAt = player.time;
            }else if(!player.isFacingRight){
                player.sprite.animations.play('attackLeft');
                player.attackStartedAt = player.time;
            }
            player.sprite.justAttacked = true;
        }
    };

    // MOVEMENT
    this.onPressLeft = function(isMovingL) { 
        player.isMovingLeft = isMovingL;
    };
    
    this.onPressRight = function(isMovingR) {
                player.isMovingRight = isMovingR;
    };
    
    this.onPressUp = function(isMovingU) {
                player.isMovingUp = isMovingU;
    };

    // private

    var updatePlayersPositions = function(player){
        // TODO: UPDATE PLAYERS POSITIONS, KILLS, ETC
    }

    // Private
    var playerControl = function(){
        if (player.isAbleToMove){ // Moviment normal
            if (player.isMovingLeft){
                //phaser.audioManager.playSound('steps', true);
                player.sprite.body.velocity.x = -490;
                if (player.time - player.attackStartedAt > 100) player.sprite.animations.play('left');
                player.isFacingRight = false;
            }else if(player.isMovingRight){
                //phaser.audioManager.playSound('steps', true);
                player.sprite.body.velocity.x = 490;
                if (player.time - player.attackStartedAt > 100) player.sprite.animations.play('right');
                player.isFacingRight = true;
            }else{
                if (player.time - player.attackStartedAt > 100) onNoDirectionPressed();
            }
            if (player.isMovingUp){
                if(player.sprite.body.touching.down) {
                    phaser.audioManager.playSound('jump', true);
                    player.sprite.body.velocity.y = -1100;
                    player.isMovingUp = false;
                }
            }
            if (!player.sprite.body.touching.down){
                if (player.isFacingRight){
                    if (player.time - player.attackStartedAt > 100) player.sprite.animations.play('jumpRight');
                }else{
                    if (player.time - player.attackStartedAt > 100) player.sprite.animations.play('jumpLeft');
                }
            }
        }else{ // lógica de quan et maten
            if (player.time - player.killedAt < 1000){
                if (mCanPlayDieAnimation){ 
                    phaser.audioManager.playSound('die',0,1,false);
                    if (player.isFacingRight) player.sprite.animations.play('dieRight');
                    if (!player.isFacingRight) player.sprite.animations.play('dieLeft');
                    mCanPlayDieAnimation = false;
                }
            } else {
                player.isAbleToMove = true;
                mCanPlayDieAnimation = true;
                // Respawn at start location
                if (player.id == "Player1") {
                    player.sprite.position.x = 60;
                    player.isFacingRight = true;
                }else{
                    player.sprite.position.x = 740;
                    player.isFacingRight = false;
                }
                player.sprite.position.y = 40;
            }
        }
        
        //finish attack - per saber que l'atack ja s'ha realitzat
        if (player.time - player.attackStartedAt > 10){
            player.sprite.justAttacked = false;
        }
    }

    var onNoDirectionPressed = function() {
        //phaser.audioManager.stopSound('steps');
        player.sprite.animations.stop();
        player.sprite.frame = 17;
        if (player.isFacingRight){
            player.sprite.frame = 17;
        }else{
            player.sprite.frame = 12;
        }
    };

    var updateOtherPlayerInClient = function() {
        if (otherPlayer.isAbleToMove){ // Moviment normal
            if (otherPlayer.isMovingLeft){
                otherPlayer.sprite.animations.play('left');
            }else if(otherPlayer.isMovingRight){
                otherPlayer.sprite.animations.play('right');
            }else{
                onNoDirectionPressedOtherPlayer();
            }
            if (otherPlayer.isMovingUp){
                if (otherPlayer.isFacingRight){
                    otherPlayer.sprite.animations.play('jumpRight');
                }else{
                    otherPlayer.sprite.animations.play('jumpLeft');
                }
            }
        }else{ // lógica de quan et maten
            if (otherPlayer.time - otherPlayer.killedAt < 1000){
                if (mCanPlayDieAnimation){ 
                    if (otherPlayer.isFacingRight) otherPlayer.sprite.animations.play('dieRight');
                    if (!otherPlayer.isFacingRight) otherPlayer.sprite.animations.play('dieLeft');
                    mCanPlayDieAnimation = false;
                }
            } else {
                otherPlayer.isAbleToMove = true;
                mCanPlayDieAnimation = true;
                // Respawn at start location
                if (otherPlayer.id == "Player1") {
                    otherPlayer.sprite.position.x = 60;
                    otherPlayer.isFacingRight = true;
                }else{
                    otherPlayer.sprite.position.x = 740;
                    otherPlayer.isFacingRight = false;
                }
                otherPlayer.sprite.position.y = 40;
            }
        }
    }

    var onNoDirectionPressedOtherPlayer = function() {
        otherPlayer.sprite.animations.stop();
        otherPlayer.sprite.frame = 17;
        if (otherPlayer.isFacingRight){
            otherPlayer.sprite.frame = 17;
        }else{
            otherPlayer.sprite.frame = 12;
        }
    };


    
    // ESCENARI
    // Aquestes 3 funcions fan el pintat de l'escenari que no te collisions (les fa el server)
    var addBackground = function() {
        phaser.add.tileSprite(0, 0, 800, 600, 'background');
    };
    
    var createGround = function() {
        mGround = mPlatforms.create(0, phaser.world.height - 50, 'floor');
    };
    
    var createLedges = function() {
         // Això farà el pintat quan el servidor estigui fora, seran les platforms sense colliders
        mLedges.push(mPlatforms.create(150, 300, 'block1'));
        mLedges.push(mPlatforms.create(600, 300, 'block1'));
        mLedges.push(mPlatforms.create(300, 500, 'block1'));
        mLedges.push(mPlatforms.create(450, 500, 'block1'));

        mLedges.push(mPlatforms.create(0, 150, 'block2'));
        mLedges.push(mPlatforms.create(0, 450, 'block2'));
        mLedges.push(mPlatforms.create(700, 150, 'block2'));
        mLedges.push(mPlatforms.create(700, 450, 'block2'));
        mLedges.push(mPlatforms.create(350, 200, 'block2'));


        mLedges.push(mPlatforms.create(300, 400, 'block4'));

        mLedges.push(mPlatforms.create(200, 250, 'block8'));
        
    };
    

    // INTERFACE
    // Això es modifica segons es fiquen ready o noReady els players fins que comença la partida
     var updateReadyStates = function() { 
        if (player.readyState){
            if (player.id == "Player1"){
                mInterfaceElementsContainer[0].sprite.loadTexture("green");
            }else{
                mInterfaceElementsContainer[1].sprite.loadTexture("green");
            }
        }else{
            if (player.id == "Player1"){
                mInterfaceElementsContainer[0].sprite.loadTexture("red");
            }else{
                mInterfaceElementsContainer[1].sprite.loadTexture("red");
            }
        }

        if (otherPlayer.readyState){
            if (otherPlayer.id == "Player1"){
                mInterfaceElementsContainer[0].sprite.loadTexture("green");
            }else{
                mInterfaceElementsContainer[1].sprite.loadTexture("green");
            }
        }else{
            if (otherPlayer.id == "Player1"){
                mInterfaceElementsContainer[0].sprite.loadTexture("red");
            }else{
                mInterfaceElementsContainer[1].sprite.loadTexture("red");
            }
        }
    };

    // Pendent Actualitzar les vides conforme les que tingui el player
    var updateInterface = function(){
        if (!mGameFinished){
            //LIFES
            //  player
            if (player.lifes < player.lifesInterfaceNextUpdate){
                if(player.id == "Player1"){
                    mInterfaceElementsContainer[0].lifes[player.lifesInterfaceNextUpdate-1].scale.setTo(0.0);
                }else{
                    mInterfaceElementsContainer[1].lifes[player.lifesInterfaceNextUpdate-1].scale.setTo(0.0);
                }
                player.lifesInterfaceNextUpdate--;
            }
            //  otherPlayer
            if (otherPlayer.lifes < otherPlayer.lifesInterfaceNextUpdate){
                if(otherPlayer.id == "Player1"){
                    mInterfaceElementsContainer[0].lifes[otherPlayer.lifesInterfaceNextUpdate-1].scale.setTo(0.0);
                }else{
                    mInterfaceElementsContainer[1].lifes[otherPlayer.lifesInterfaceNextUpdate-1].scale.setTo(0.0);
                }
                otherPlayer.lifesInterfaceNextUpdate--;
            }
            //KILLS
            //  player
            if (player.kills > player.killsInterfaceUpdated){
                if(player.id == "Player1"){
                    mInterfaceElementsContainer[0].kills[player.kills-1].scale.setTo(1.1);
                }else{
                    mInterfaceElementsContainer[1].kills[player.kills-1].scale.setTo(1.1);
                }
                player.killsInterfaceUpdated++;
            }
            //  otherPlayer
            if (otherPlayer.kills > otherPlayer.killsInterfaceUpdatedOtherClient){
                if(otherPlayer.id == "Player1"){
                    mInterfaceElementsContainer[0].kills[otherPlayer.kills-1].scale.setTo(1.1);
                }else{
                    mInterfaceElementsContainer[1].kills[otherPlayer.kills-1].scale.setTo(1.1);
                }
                otherPlayer.killsInterfaceUpdatedOtherClient++;
            }
            //updatePlayerInServer(otherPlayer);
            
        }else{ // Si s'ha acavat el joc perque han matat a algú 3 cops -> Mostro la interface de win lose
            if (mMustDrawFinishInterface){
                mInterfaceElementsContainer[0].replayButton = phaser.add.button(phaser.width/2-75, phaser.height/2-250, 'replayButton', replayButtonClick, this);
                mInterfaceElementsContainer[0].backButton = phaser.add.button(phaser.width/2-75, phaser.height/2+20, 'backButton', backButtonClick, this);

                if (player.lifes == 0){
                    phaser.audioManager.playSound('loser',0,1,false);
                    mInterfaceElementsContainer[0].winLoseBanner = phaser.add.sprite(phaser.width/2-381, 125, 'youLose');
                }else{
                    phaser.audioManager.playSound('winner',0,1,false);
                    mInterfaceElementsContainer[0].winLoseBanner = phaser.add.sprite(phaser.width/2-381, 125, 'youWin');
                }

                mMustDrawFinishInterface = false;
            }
        }

        // end game
        if (player.gameIsFinished) mGameFinished = true;
    };

    var replayButtonClick = function(){
        resetInterface();
    };
    var backButtonClick = function(){
        // TODO: fer que quan el tio tiri enrere es quedi el joc be, perque ara quan tornes a donar a connect no reconecta, has de fer f5
        var simplePlayer = parsePlayerForServer(player);
        socket.emit('goBackMenu',simplePlayer);
        phaser.state.start('menu');
    };

    var resetInterface = function(){
        // Change property "resetGame" to true to make know to the server that player has clicked reset
        //mPlayers.forEach(function(player){ // Això quan estigui amb el server de veritat es fara nomes per 1 player, el del client
            player.resetGame = true;
            resetGameCalled();
            player.gameIsFinished = false;
            // Hide interface
            //if (player.id == "Player1"){
                mInterfaceElementsContainer[0].lifes.forEach(function(life){
                    life.scale.setTo(0.0);
                });
                mInterfaceElementsContainer[0].kills.forEach(function(skull){
                    skull.scale.setTo(0.0);
                })
            //}else{
                mInterfaceElementsContainer[1].lifes.forEach(function(life){
                    life.scale.setTo(0.0);
                });
                mInterfaceElementsContainer[1].kills.forEach(function(skull){
                    skull.scale.setTo(0.0);
                })  
            //}
            
       // });

        // Player text
        mInterfaceElementsContainer[0].text.scale.setTo(0,0);
        mInterfaceElementsContainer[1].text.scale.setTo(0,0);

        // Buttons
        mInterfaceElementsContainer[0].replayButton.scale.setTo(0,0);
        mInterfaceElementsContainer[0].backButton.scale.setTo(0,0);

        // Win lose banner
        mInterfaceElementsContainer[0].winLoseBanner.scale.setTo(0,0);

        // Reset initial interface
        instantiateInterface();

        // Reset local vars
        mCanRemoveReadySprites = true;
        mGameFinished = false;
        mMustDrawFinishInterface=true;
    }


    

    // Això crea la interface de primeres
    var instantiateInterface = function(){
        // Això esta per dos players, amb el server haurà d'estar per 1 sol player
        mReadySprite = phaser.add.group();
        // Player 1
        mInterfaceElementsContainer[0] = new Object();
        mInterfaceElementsContainer[0].sprite = mReadySprite.create(20, 25, 'red');
        mInterfaceElementsContainer[0].text = phaser.add.text(10, 0, 'Player 1:', { font: '20px Arial', fill: '#FFF' });
        

        var lifes = [
            mReadySprite.create(5, 25, 'heart'),
            mReadySprite.create(37, 25, 'heart'),
            mReadySprite.create(69, 25, 'heart')
        ];
        lifes.forEach(function(life){
            life.scale.setTo(0.0);
        });
        mInterfaceElementsContainer[0].lifes = lifes;
        var skulls = [
            mReadySprite.create(5, 60, 'skull'),
            mReadySprite.create(5, 90, 'skull'),
            mReadySprite.create(5, 120, 'skull'),
            mReadySprite.create(5, 150, 'skull'),
            mReadySprite.create(5, 180, 'skull'),
            mReadySprite.create(5, 210, 'skull')
        ];
        skulls.forEach(function(skull){
            skull.scale.setTo(0.0);
        });
        mInterfaceElementsContainer[0].kills = skulls;

        // Player 2
        mInterfaceElementsContainer[1] = new Object();
        mInterfaceElementsContainer[1].sprite = mReadySprite.create(730, 25, 'red');
        mInterfaceElementsContainer[1].text = phaser.add.text(715, 0, 'Player 2:', { font: '20px Arial', fill: '#FFF' });
        
        lifes = [
            mReadySprite.create(764, 25, 'heart'),
            mReadySprite.create(732, 25, 'heart'),
            mReadySprite.create(700, 25, 'heart')
        ];
        lifes.forEach(function(life){
            life.scale.setTo(0.0);
        });
        mInterfaceElementsContainer[1].lifes = lifes;
        skulls = [
            mReadySprite.create(765, 60, 'skull'),
            mReadySprite.create(765, 90, 'skull'),
            mReadySprite.create(765, 120, 'skull'),
            mReadySprite.create(765, 150, 'skull'),
            mReadySprite.create(765, 180, 'skull'),
            mReadySprite.create(765, 210, 'skull')
        ];
        skulls.forEach(function(skull){
            skull.scale.setTo(0.0);
        });
        mInterfaceElementsContainer[1].kills = skulls;
    };
    

    var onPlayerOverlap = function(player1, player2) {
        
        if (player.sprite.justAttacked && otherPlayer.isAbleToMove){
            if ((player.isFacingRight && player.sprite.position.x-20 < otherPlayer.sprite.position.x) || (!player.isFacingRight && player.sprite.position.x+20 > otherPlayer.sprite.position.x)){
                killSomeOne(player, otherPlayer);
            }
            player.sprite.justAttacked = false;
        }else if(otherPlayer.sprite.justAttacked && player.isAbleToMove){
            if ((otherPlayer.isFacingRight && otherPlayer.sprite.position.x < player.sprite.position.x) || (!otherPlayer.isFacingRight && otherPlayer.sprite.position.x > player.sprite.position.x)){
                killSomeOne(otherPlayer, player);
            }
            otherPlayer.sprite.justAttacked = false;
        }
    };

    var killSomeOne = function(killer, killed){
        phaser.audioManager.playSound('katanaHit',0,1,false);
        phaser.audioManager.playSound('die',0,1,false);
        killed.lifes--;
        killer.kills++;
        killed.killedAt = killed.time;
        killed.isAbleToMove = false;
        if (killed.lifes == 0){
            mGameFinished = true;
            killed.gameIsFinished = true;
            killer.gameIsFinished = true;
        }
        updatePlayerInServer(killed);
    };

    var enablePhysics = function() {
        phaser.physics.arcade.enable(mPlatforms);
        mGround.body.immovable = true;
        mLedges.forEach(function(ledge) {
            ledge.body.immovable = true;
        });
    };

    // Player sprites
    var createPlayerSprite = function(){
        console.log(player.id);
        if (player.id == "Player1") {
            mSprite = phaser.add.sprite(0, 0, 'player');
        }else{
            mSprite = phaser.add.sprite(0, 0, 'player2');
        }
        mSprite.animations.add('left', [0, 1, 2], 20, true);
        mSprite.animations.add('right', [3, 4, 5], 20, true);
        mSprite.animations.add('jumpLeft', [8, 7, 6], 10, true);
        mSprite.animations.add('jumpRight', [9, 10, 11], 10, true);
        mSprite.animations.add('attackLeft', [12, 13, 14], 30, false, true);
        mSprite.animations.add('attackRight', [17, 16, 15], 30, false, true);
        mSprite.animations.add('dieLeft', [18, 19], 3, false, true);
        mSprite.animations.add('dieRight', [21, 20], 3, false, true);
        mSprite.anchor.setTo(0.5, 0.5);
        mSprite.scale.setTo(0.7, 0.7);
    };

    var createOtherPlayerSprite = function(){
        if (player.id == "Player1") {
            mSpriteOtherPlayer = phaser.add.sprite(0, 0, 'player2');
        }else{
            mSpriteOtherPlayer = phaser.add.sprite(0, 0, 'player');
        }
        mSpriteOtherPlayer.animations.add('left', [0, 1, 2], 20, true);
        mSpriteOtherPlayer.animations.add('right', [3, 4, 5], 20, true);
        mSpriteOtherPlayer.animations.add('jumpLeft', [8, 7, 6], 10, true);
        mSpriteOtherPlayer.animations.add('jumpRight', [9, 10, 11], 10, true);
        mSpriteOtherPlayer.animations.add('attackLeft', [12, 13, 14], 30, false, true);
        mSpriteOtherPlayer.animations.add('attackRight', [17, 16, 15], 30, false, true);
        mSpriteOtherPlayer.animations.add('dieLeft', [18, 19], 3, false, true);
        mSpriteOtherPlayer.animations.add('dieRight', [21, 20], 3, false, true);
        mSpriteOtherPlayer.anchor.setTo(0.5, 0.5);
        mSpriteOtherPlayer.scale.setTo(0.7, 0.7);
    };

    var finishGame = function(){
        phaser.audioManager.playSound('die',0,1,false);
        if (player.lifes == 0){
            if (mCanPlayDieAnimation){ 
                if (player.isFacingRight) player.sprite.animations.play('dieRight');
                if (!player.isFacingRight) player.sprite.animations.play('dieLeft');
                mCanPlayDieAnimation = false;
            }
        }else{
            // TODO: var en el objecte other player per saber si pot reproduirse la animacio de die i fer el mateix que amb el player
            if (otherPlayer.isFacingRight) otherPlayer.sprite.animations.play('dieRight');
            if (!otherPlayer.isFacingRight) otherPlayer.sprite.animations.play('dieLeft');
        }
    }


    var resetGameCalled = function(){
        player.readyState = false;
        player.lifes = 3;
        player.kills = 0;
        player.isFacingRight = true;
        player.isMovingRight = false;
        player.isMovingLeft = false;
        player.isMovingUp = false;
        player.attackStartedAt = null;
        player.killsInterfaceUpdated = 0;
        player.gameIsFinished = false;
        player.isAbleToMove = true;
        player.killedAt = null;
        player.resetGame = false;
        
        // Sprite config
        if (player.id == "Player1") {
            player.sprite.position.x = 60;
        }else if(player.id == "Player2"){
            player.sprite.position.x = 740;
            player.isFacingRight = false;
        }
        player.sprite.position.y = 40;
        player.sprite.justAttacked = false;

        otherPlayer.readyState = false;

        updatePlayerInServer(player);
        updatePlayerInServer(otherPlayer);

        mGameStarted = false;
        mGameFinished = false;
        mCanPlayDieAnimation = true;
        mResetGameCalled = false;
        
    };

    // Constructor
    (function() {       
        mPlayers = new Array();  
        player = new Object();
        otherPlayer = new Object();
        mInterfaceElementsContainer = new Array();
        addBackground();  

        // Create ground group 
        mPlatforms = phaser.add.group();
        createGround();
        createLedges();
        enablePhysics();

        // Create interface
        instantiateInterface();
    })();
};