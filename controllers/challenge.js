// initialize our modules
var passportSocketIo = require("passport.socketio");
var escape = require('escape-html');
var games = require('./games');
const pug = require('pug');

function GameEngine(_io)
{
		var that = this;
		that.io = _io;
		that.games = [new games.PressGame()];
		that.game = null;
		that.state = 'PLAY'; //SCORE, PREPARE, PLAY
		that.getScore = function()
		{
			return [{
				'user':'U',
				'email':'E',
				'score':'1'
			}];
		};
		
		that.nextstatetime = null;
		that.timeout = null;
		
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
					that.io.sockets.emit('state', {state:that.state, html:that.renderState(),js:''});
					break;
				}
				case 'PREPARE':
				{
					that.state = 'PLAY';
					console.log("New STATE:", that.state);
					var g_duration = that.game.start();
					that.nextstatetime = new Date((new Date()).getTime() + g_duration);
					that.io.sockets.emit('state', {state:that.state, html:that.game.getHTML(), js:that.game.getJS()});
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
						var game_info = that.game.stop();
					}
					if (that.games.length === 0)
					{
						
						that.state = 'END';
						console.log("New STATE:", that.state);
					}
					else
					{
						that.game = that.games.shift();
						console.log("Next game is:", that.game.name);
						that.nextstatetime = new Date(nextGameDate().getTime()-1000*60*60);
					}
					
					that.io.sockets.emit('state', {state:that.state, html:that.renderState(),js:''});
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
		
		return that;
}

var gameengine = null;

function getUserName(user)
{
		var name= user.email;
		if(user.profile && user.profile.name)
		{
				var aname = user.profile.name.split(' ');
				if (aname.length > 1 && aname[0].length > 0)
				{
						name = aname[1] + ' ' + aname[0][0];
				}
				else
						name = user.profile.name;
		}
		return name;
}
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
					socket.broadcast.emit('chat message', {'user':getUserName(socket.request.user),'msg':escape(msg)});
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