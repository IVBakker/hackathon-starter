// initialize our modules
var passportSocketIo = require("passport.socketio");
var Promise = require('es6-promise').Promise;
var escape = require('escape-html');
var games = require('./games');
const pug = require('pug');
const Score = require('../models/Score')
const GameScore = require('../models/GameScore')

function GameEngine(_io)
{
		var that = this;
		that.io = _io;
//		that.games = [new games.MathGame(),
//		new games.PressGame(),
//		new games.MazeGame(),
//		new games.LoremGame(),
//		new games.DanceGame(),
//		new games.CircleGame(),
//		new games.GeoGame()];
		that.games = [new games.CircleGame(), new games.LoremGame()];
		that.game = null;
		that.state = 'PLAY'; //SCORE, PREPARE, PLAY
		that.lastgamescores = null;
		that.scoreboard = [];
		
		that.updateScoreboard = function(callback)
		{
			Score.find({},{}, function(err, scores){
				that.scoreboard = scores.sort(function(a,b){return b.score - a.score;});
				console.log("Updating Scoreboard:");
				scores.forEach(function(s){console.log(s.email,': ',s.score);});
				if(callback !== undefined)
					callback();
			});
			
		};
		
		that.nextstatetime = null;
		that.timeout = null;
		
		that.handle = function(socket,email,input)
		{
			if(that.state === 'PLAY' && that.game !== null)
			{
//				console.log("GAME", that.game);
				var answer = that.game.handle(email, input);
				console.log('INPUT:', input, 'ANSWER:', answer);
				if (['C','E','F'].indexOf(answer[0]) !== -1)
				{
					socket.emit('answer', answer);
				}
			}
		};
		
		that.renderState = function()
		{
				var base_view = 'views/games/';
				return pug.renderFile(base_view+this.state.toLocaleLowerCase()+'.pug', {engine:that, game:that.game});
		};
		
		that.nextStateWaitTime = function()
		{
			var now = new Date();
			return that.nextstatetime.getTime()-now.getTime();
		};
		
		that.nextState = function()
		{
			function nextGameDate()
			{
				var now = new Date();
				var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
				//before 12
				if(target < now)
				{
					//before 17
					target.setHours(17);
					if(target < now)
					{
						target.setHours(12);
						target.setDate(now.getDate()+1);
					}
				}
				console.log("Next Game at", target);
				return target;
			}
			
			switch(that.state)
			{
				case 'SCORE':
				{
					that.state = 'PREPARE';
					console.log("New STATE:", that.state);
					that.nextstatetime = nextGameDate();
					that.io.sockets.emit('state', {state:that.state, html:that.renderState(),js:''});
					break;
				}
				case 'PREPARE':
				{
					that.state = 'PLAY';
					console.log("New STATE:", that.state);
					var g_duration = that.game.start();
					that.nextstatetime = new Date((new Date()).getTime() + g_duration);
					that.io.sockets.emit('state', {state:that.state, name:that.game.name, html:that.game.getHTML(), js:that.game.getJS()});
					break;
				}
				case 'PLAY':
				{
					that.state = 'SCORE';
					console.log("New STATE:", that.state);
					//Stop the game and play the score
					if(that.game !== null)
					{
						//Stop the game if necessary
						console.log("END of game", that.game.name);
						that.lastgamescores = that.game.stop();
						var game_name = that.game.name;
						var player_results = that.game.players;
						var nplayer_results = player_results.length;
						player_results.forEach(function(p,i)
						{
							console.log("Saving Score for ", p.email,"- score",p.score," ",i+1,"/",nplayer_results);
							Score.findOne({ email: p.email }, function(err, existingScore)
							{
								if(!existingScore)
								{
									console.log("THIS USER DOES NOT HAVE A SCORE");
									existingScore = new Score();
									existingScore.email = p.email;
									existingScore.username = p.email;
								}
								existingScore.scores.push({score:p.score,game:game_name});
								existingScore.save(function(){
									if (i === nplayer_results-1)
									{
										that.updateScoreboard(function(){that.io.sockets.emit('state', {state:that.state, html:that.renderState(),js:''});});
									}
								});
							});
							
							p.actions.forEach(function(a){
								a.save();
							});
							
						});
						
					}
					if (that.games.length === 0)
					{
						console.log("New STATE:", that.state);
						that.state = 'END';
						that.game = null;
					}
					else
					{
						that.game = that.games.shift();
						console.log("Next game is:", that.game.name);
						that.nextstatetime = new Date(nextGameDate().getTime()-1000*60*60);
					}
					
					break;
				}
				default:
			}
			if (that.timeout !== null)
			{
				clearTimeout(that.timeout);
				that.timeout = null;
			}
			if (that.state !== 'END')
			{
				var waittime = that.nextStateWaitTime();
				console.log("Waiting for next state: ", waittime);
				that.timeout = that.setTimeout(function(){console.log("Timeout next state over");that.nextState();}, waittime);
			}
		};

		that.nextState();
		GameScore.findOne({}, {}, { sort: { 'createdAt' : -1 } }, function(err, score) {
			if(score)
			{
				console.log("Last game score found:", score.name);
				score.scores.sort(function(a,b){return b.score-a.score;});
				that.lastgamescores = score;
			}
		});
		that.updateScoreboard();
		
		return that;
}

var gameengine = null;


exports.setIo = function(io, sessionstore)
{
		io.use(passportSocketIo.authorize({
			secret: process.env.SESSION_SECRET, // the session_secret to parse the cookie
			store: sessionstore, // we NEED to use a sessionstore. no memorystore please
			success: onAuthorizeSuccess, // *optional* callback on success - read more below
			fail: onAuthorizeFail // *optional* callback on fail/error - read more below
		}));
		
		io.on('connection', function(socket)
		{
				console.log("New connection from ", socket.request.user.email);
				socket.on('chat message', function(msg)
				{
//					console.log("Message received", msg);
					socket.broadcast.emit('chat message', {'user':socket.request.user.username,'msg':escape(msg)});
				});
				socket.on('input', function(input)
				{
					gameengine.handle(socket,socket.request.user.email,input);
				});
		});
		gameengine = GameEngine(io);
		return gameengine;
};

exports.controller = function(req, res){
	res.render('competition', {
			title: 'IO Challenge',
			engine: gameengine
		});
};

function onAuthorizeSuccess(data, accept){
	console.log('IO connection:', data.user.email);
	accept();
}

function onAuthorizeFail(data, message, error, accept){
	if(error)
		throw new Error(message);
	console.log('Failed IO connection:', message);

	if(error)
		accept(new Error(message));
}