
// Server functionality at end

// SERVER LOGIC
var Server = function() {
    var mPlayers = [];
    var mPlayer1 = null;
    var mPlayer2 = null;
    var mGameStarted = false;
    var mGameFinished = false;
    // colliders
    var mPlatforms = null;
    var mGround = null;
    var mLedges = [];  
    var mSprite = null; 


    // auxiliar
    //var mCanPlayDieAnimation = true; // nomes pot morir 1 a la vegada, no hi ha double kill

    // semofors
    var mGameStarted = false;
    var mGameFinished = false;
    var mResetGameCalled = false;
    
    // Public
    this.update = function() {
       
    };

    this.createId = function(playerId){
        if (mPlayer1 == null){
            mPlayer1 = new Object();
            mPlayer1.id = 'Player1';
            //mPlayer1.timeNow = timeNow;
            return mPlayer1.id;
        }else if(mPlayer2 == null){
            mPlayer2 = new Object();
            mPlayer2.id = 'Player2';
            //mPlayer2.timeNow = timeNow;
            return mPlayer2.id;
        }else{
            return 'spectator';
        }
    };
    
    this.setPlayer = function(index, player) {
        mPlayers[index] = player;
    };

    this.removePlayer = function(playerId){
        if (playerId == 'Player1'){
            mPlayer1 = null;
        }else if(playerId == 'Player2'){
            mPlayer2 = null;
        }else{
            console.log('can\' remove Spectator, it has any trace');
        }
    };

    this.updatePlayerInServer = function(player){
        if (player.id == 'Player1'){
            mPlayer1.id = player.id;
            mPlayer1.readyState = player.readyState;
            mPlayer1.lifes = player.lifes;
            mPlayer1.kills = player.kills;
            mPlayer1.isFacingRight = player.isFacingRight;
            mPlayer1.isMovingRight = player.isMovingRight;
            mPlayer1.isMovingLeft = player.isMovingLeft;
            mPlayer1.isMovingUp = player.isMovingUp;
            mPlayer1.attackStartedAt = player.attackStartedAt;
            mPlayer1.killsInterfaceUpdated = player.killsInterfaceUpdated;
            mPlayer1.lifesInterfaceNextUpdate = player.lifesInterfaceNextUpdate;
            mPlayer1.gameIsFinished = player.gameIsFinished;
            mPlayer1.isAbleToMove = player.isAbleToMove;
            mPlayer1.killedAt = player.killedAt;
            mPlayer1.resetGame = player.resetGame;
            mPlayer1.x = player.x;
            mPlayer1.y = player.y;
            mPlayer1.justAttacked = player.justAttacked;
            mPlayer1.time = +new Date();
        }else if(player.id == 'Player2'){
            mPlayer2.id = player.id;
            mPlayer2.readyState = player.readyState;
            mPlayer2.lifes = player.lifes;
            mPlayer2.kills = player.kills;
            mPlayer2.isFacingRight = player.isFacingRight;
            mPlayer2.isMovingRight = player.isMovingRight;
            mPlayer2.isMovingLeft = player.isMovingLeft;
            mPlayer2.isMovingUp = player.isMovingUp;
            mPlayer2.attackStartedAt = player.attackStartedAt;
            mPlayer2.killsInterfaceUpdated = player.killsInterfaceUpdated;
            mPlayer2.lifesInterfaceNextUpdate = player.lifesInterfaceNextUpdate;
            mPlayer2.gameIsFinished = player.gameIsFinished;
            mPlayer2.isAbleToMove = player.isAbleToMove;
            mPlayer2.killedAt = player.killedAt;
            mPlayer2.resetGame = player.resetGame;
            mPlayer2.x = player.x;
            mPlayer2.y = player.y;
            mPlayer2.justAttacked = player.justAttacked;
            mPlayer2.time = +new Date();
        }
    };

    this.updateReadyStateInServer = function(mId, readyState){
        console.log(mId, " ready state: ", readyState, "    -   ");
        if (mPlayer1.id == mId) mPlayer1.readyState = readyState;
        if (mPlayer2.id == mId) mPlayer2.readyState = readyState;
    };


    this.updatePlayersInClient = function(){
        packagePlayers();
        return mPlayers;
    };

    var packagePlayers = function(){
        mPlayers[0] = mPlayer1;
        mPlayers[1] = mPlayer2;
    };

    // Constructor
    (function() {
        mPlayers = new Array();
    })();
};




// SOCKETS
var serverLogic = new Server();
//var phaser = require('phaser');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/app'));
app.get('/',function(req,res){
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    var data = serverLogic.createId(null);
    io.sockets.emit ('idCreated', data); // Això nomès ho agafen els clients amb id null
    socket.id = data;
    console.log('a user connected: ', socket.id, " at: ", +new Date());

    socket.on('disconnect', function(){
        console.log('user disconnected: ', socket.id);
        serverLogic.removePlayer(socket.id);
    });

    socket.on('goBackMenu', function(player){
        console.log('user disconnected: ',player.id);
    });

    // WORLD PETICIONS
    // Update player in server
    socket.on ('updatePlayerInServer', function (player) {
        serverLogic.updatePlayerInServer(player);
        // Send this new position to all clients
        io.sockets.emit ('updatePlayersInClient', serverLogic.updatePlayersInClient());
    });
    socket.on ('updateReadyStateInServer', function(mId, readyState){
        serverLogic.updateReadyStateInServer(mId, readyState);
    });
});

server.listen(8000, function(){
    console.log('listening on *:8000');
});