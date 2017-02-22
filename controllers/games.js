var util = require('util');
var fs = require('fs');
var pug = require('pug');

var GameBase = function() {
	this.name = "Undefined";
	this.codename = "Undefined";
	this.players = [];
	this.finish_line = [];
	this.duration = 1000*5*60;
	this.started = false;
};

GameBase.prototype.start = function() {
	this.started = true;
	return this.duration;
};

GameBase.prototype.stop = function(){
	this.started = false;
};

GameBase.prototype.getRules = function(){
	var rule_view = 'views/games/'+this.codename+'/rules.pug';
	return pug.renderFile(rule_view);
};

GameBase.prototype.getHTML = function(){
	var game_view = 'views/games/'+this.codename+'/game.pug';
	return pug.renderFile(game_view);
};

GameBase.prototype.getJS = function(){
	
	var rule_view = 'views/games/'+this.codename+'/game.js';
	return fs.readFileSync(rule_view).toString();
};

var PressGame = function() {
	GameBase.call(this);
	this.name = "Click, Click, Click";
	this.codename = "clickclick";
	this.duration = 1000*60;
};

util.inherits(PressGame, GameBase);

exports.PressGame = PressGame;