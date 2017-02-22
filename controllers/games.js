var util = require('util');

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

GameBase.prototype.getHTML = function(){
	return '<h1>HELLO FROM THE GAME</h1>';
};

GameBase.prototype.getJS = function(){
	return '';
};

var PressGame = function() {
	GameBase.call(this);
	this.name = "Click, Click, Click";
	this.codename = "clickclick";
};

util.inherits(PressGame, GameBase);

exports.PressGame = PressGame;