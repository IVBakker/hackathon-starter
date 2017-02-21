// initialize our modules
var passportSocketIo = require("passport.socketio");
var escape = require('escape-html');
var games = require('./games');
const pug = require('pug');

function GameEngine(_io)
{
		this.io = _io;
		this.games = [new games.PressGame()];
		this.game = null;
		this.state = 'PLAY'; //SCORE, PREPARE, PLAY
		this.getScore = function()
		{
			return [{
				'user':'U',
				'email':'E',
				'score':'1'
			}];
		};
		
		this.nextstatetime = null;
		
		this.nextStateWaitTime = function()
		{
			var now = new Date();
			return this.nextstatetime.getTime()-now.getTime();
		};
		
		this.nextState = function()
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
			switch(this.state)
			{
				case 'SCORE':
				{
					this.state = 'PREPARE';
					
					
					
					
					break;
				}
				case 'PREPARE':
				{
					this.state = 'PLAY';
					this.nextstatetime = new Date((new Date()).getTime() + this.game.duration);
					var game_info = this.game.start();
					break;
				}
				case 'PLAY':
				{
					this.state = 'SCORE';
					//Stop the game and play the score
					if(this.game !== null)
					{
						//Stop the game if necessary
						console.log("END of game", this.game.name);
						var game_info = this.game.stop();
						//Send next state to clients
					}
					this.game = this.games.shift();
					console.log("Next game is:", this.game.name);
					this.nextstatetime = new Date(nextGameDate().getTime()-1000*60*60);
					break;
				}
			}
		};

		this.nextState();
		
						
		this.renderState = function()
		{
				var base_view = 'views/games/';
				
				return pug.renderFile(base_view+this.state.toLocaleLowerCase()+'.pug', {engine:this, game:this.game});
		};
		
		return this;
}



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
module.exports = function(io, sessionstore)
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
		
		var gameengine = GameEngine();		
		
		return function(req, res){
				res.render('competition', {
						title: 'IO Challenge',
						engine: gameengine
					});
				};
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