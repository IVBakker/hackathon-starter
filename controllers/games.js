var util = require('util');
var fs = require('fs');
var pug = require('pug');
var Action = require('../models/UserAction');
var GameScore = require('../models/GameScore');

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

GameBase.prototype.handle = function(){
	//TO OVERWRITE
	throw new Error('HANDLE FUNCTION TO OVERWRITE');
};

GameBase.prototype.getFinalScore = function(){
	//TO OVERWRITE
	throw new Error('FINAL SCORE FUNCTION TO OVERWRITE');
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
	var action = new Action();
	action.email = email;
	action.game = this.name;
	action.action = input;
	action.time = new Date();
	
	p['actions'].push(action);
	return p;
};

GameBase.prototype.getRules = function(){
	var rule_view = 'views/games/'+this.codename+'/rules.pug';
	return pug.renderFile(rule_view);
};

GameBase.prototype.getHTML = function(){
	var game_view = 'views/games/'+this.codename+'/game.pug';
	return pug.renderFile(game_view, {data:this.getStartData()});
};

GameBase.prototype.getJS = function(){
	var rule_view = 'views/games/'+this.codename+'/game.js';
	return fs.readFileSync(rule_view).toString();
};


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
var PressGame = function() {
	GameBase.call(this);
	this.name = "Click, Click, Click";
	this.codename = "clickclick";
	this.duration = 1000*60;
};

util.inherits(PressGame, GameBase);

PressGame.prototype.getStartData = function(){
	return 0;
};

PressGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		p['data']+=1;
//		console.log("Player input", p);

		return ['C', p['data']]; //Continue
	}
	return ['E', -1]; //Ended
};

PressGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return b['data'] - a['data'];});
//	var cur_index = 0;
//	var cur_value = null;
//	for (var current_score = 10; ++cur_index; current_score > 1)
//	{
//		if(cur_value === null || this.players[cur_index]['data'] === cur_value)
//		{
//			
//		}
//		else
//		{
//			cur_value = this.players[cur_index]['data'];
//			
//		}
//			
//	}
	this.players = this.players.map(function(c,i){c['score'] = Math.max(1,10-i); return c;});
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data};
	});
	final_score.sort(function(a,b){return a['score'] - b['score'];});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
//	console.log("Players finish state:", this.players);
};

exports.PressGame = PressGame;

var MathGame = function() {
	GameBase.call(this);
	this.name = "1+1? 11?";
	this.codename = "maths";
	this.duration = 1000*60;
};

util.inherits(MathGame, GameBase);

MathGame.prototype.getStartData = function(){
	return {
		score:0,
		problems:[['1+1',2],['7+8*3',31],['21-17+5',9],['12*11',132],['99/9',11],['4*3+2*6*1',24],['10*18*3+2',542],['5*7*9-77',2],['23-9*6+465',2],['123-46',2],
		['3*(4+6+23)',99],['147 + 680',2],['23*7',2],['53*12',2],['101-9-8-7-6-5',2],['',2],['',2],['',2],['',2],['',2],['',2],
		['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],
		['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],
		['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],
		['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2],['',2]
		]
	};
};

MathGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		console.log('Input math',input,'Expected', p['data']['problems'][0]);
		if(input === p['data']['problems'][0][1])
		{
			 p['data']['score'] += 1;
			 p['data']['problems'].shift();
			 return ['C', p['data']['problems'][0][0]]; //Continue
		}
		else
		{
			p['data']['score'] -= 0.2;
			return ['F', -1];
		}
	}
	return ['E', -1]; //Ended
};

MathGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return b['data']['score'] - a['data']['score'];});
	this.players = this.players.map(function(c,i){c['score'] = Math.max(1,10-i); return c;});
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['score']};
	});
	final_score.sort(function(a,b){return a['score'] - b['score'];});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
};

exports.MathGame = MathGame;


var GeoGame = function() {
	GameBase.call(this);
	this.name = "Where is Wally?";
	this.codename = "geo";
	this.duration = 5000*60;
};

util.inherits(GeoGame, GameBase);

GeoGame.prototype.getStartData = function(){
	return {
		score:0,
		locations:[[{lat: 37.743186, lng: -122.462571},'sanfrancisco'],[{lat: 19.343259, lng: -99.121668},'mexicocity'],
			[{lat: 50.845351, lng: 4.365525},'brussels'],[{lat:34.390706, lng: 132.461082},'hiroshima'],
			[{lat: 31.7767379,lng: 35.228829},'jerusalem'],[{lat: 45.536997, lng: -73.602447},'montreal'],
			[{lat: 41.4050628, lng: 2.1798117},'barcelona'],[{lat: 43.740081, lng: 7.421485},'monaco'],
			[{lat: 55.6786931, lng: 12.5798913},'copenhagen'],[{lat: 32.7906444, lng: -96.83309},'dallas']
		]
	};
};

GeoGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		console.log(email, 'Input city',input,'Expected', p['data']['locations'][0][1]);
		if(input === p['data']['locations'][0][1])
		{
			 p['data']['score'] += 1;
			 p['data']['locations'].shift();
			 return ['C', p['data']['locations'][0][0]]; //Continue
		}
		else
		{
			p['data']['score'] -= 0.1;
			return ['F', -1];
		}
	}
	return ['E', -1]; //Ended
};

GeoGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return b['data']['score'] - a['data']['score'];});
	this.players = this.players.map(function(c,i){c['score'] = Math.max(1,10-i); return c;});
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['score']};
	});
	final_score.sort(function(a,b){return a['score'] - b['score'];});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
};

exports.GeoGame = GeoGame;