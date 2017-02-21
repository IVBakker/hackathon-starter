

var inheritsFrom = function (child, parent) {
		child.prototype = Object.create(parent.prototype);
};

var GameBase = function() {
		this.name = "Undefined";
		this.players = [];
		this.finish_line = [];
		this.duration = 5*60;
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
		
};

GameBase.prototype.getJS = function(){
		
};

var PressGame = function() {
		this.name = "Pull up, push up";
		
};

inheritsFrom(PressGame, GameBase);

exports.PressGame = PressGame;