var util = require('util');
var fs = require('fs');
var pug = require('pug');

var GameBase = function() {
	this.name = "Undefined";
	this.codename = "Undefined";
	this.players = [];
	this.duration = 1000*5*60;
	this.started = false;
	this.start_time = null;
	this.playerfinished = 0;
};

GameBase.prototype.start = function() {
	this.started = true;
	this.start_time = new Date();
	return this.duration;
};

GameBase.prototype.stop = function() {
	this.started = false;
};

GameBase.prototype.getStartData = function(){
	return null;
};

GameBase.prototype.prehandle = function(email, input){
	var p = this.players.find(function(player){return player['email'] === email;});
	if(p === undefined)
	{
		p={
			email: email,
			score:1,
			data:this.getStartData(),
			actions: [],
			isfinished: false
		};
		this.players.push(p);
	}
	p['actions'].push([new Date(),input]);
	return p;
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

PressGame.prototype.getStartData = function(){
	return 0;
};

PressGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		p['data']+=1;
		console.log("Player input", p);

		return ['C', p['data']]; //Continue
	}
	return ['E', -1]; //Ended
};

PressGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return a['data'] - b['data'];});
	this.players = this.players.map(function(c,i){c['score'] = Math.max(1,10-i); return c;});
	console.log("Players finish state:", this.players);
};

util.inherits(PressGame, GameBase);

exports.PressGame = PressGame;