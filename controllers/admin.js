var io;
var gameengine;
var games = require('./games');
var Score = require('../models/Score');
var Action = require('../models/UserAction');
var GameScore = require('../models/GameScore');

function index(req, res){
	res.render('admin', {
		title: 'Admin'
	});
};

function gameTest(req, res){
//	var this_game = new games.PressGame();
//	var this_game = new games.MathGame();
//	var this_game = new games.GeoGame();
//	var this_game = new games.MazeGame();
//	var this_game = new games.LoremGame();
//	var this_game = new games.DanceGame();
//	var this_game = new games.TimerGame();
//	var this_game = new games.CircleGame();
	var this_game = new games.ClimbingGame();
	res.render('gametest', {
		title: 'Admin Test Room',
		html: this_game.getHTML(),
		js: this_game.getJS()
	});
}

function control(req, res){
		
		console.log("KEY", req.body.key);
//		console.log("BODY", req.body);
		switch(req.body.key)
		{
				case 'reload':
				{
						io.sockets.emit('page_reload');
						break;
				}
				case 'next':
				{
						gameengine.nextState();
						break;
				}
				case 'scoreboard':
				{
						gameengine.updateScoreboard();
						break;
				}
				case 'drop':
				{
					Action.remove({}).exec();
					GameScore.remove({}).exec();
					Score.remove({}, function(){gameengine.updateScoreboard();});
					break;
				}
				default:
		}
		res.end();
};

module.exports = function(_io,_engine)
{
		io = _io;		
		gameengine = _engine;		
		
		return {
				index: index,
				test: gameTest,
				control: control
		};		
};