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
	var cur_gamescore = null;
	var cur_rewardscore = 10;
	for(var i=0;i<this.players.length;++i)
	{
		var cur_player = this.players[i];
		if(cur_gamescore!== null && cur_player['data'] !== cur_gamescore)
		{
			--cur_rewardscore;
		}
		if(cur_rewardscore === 1)
			break;
		cur_gamescore = cur_player['data'];
		cur_player['score'] = cur_rewardscore;
	}
	
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data};
	});
	final_score.sort(function(a,b){return b['score'] - a['score'];});
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
	var cur_gamescore = null;
	var cur_rewardscore = 10;
	for(var i=0;i<this.players.length;++i)
	{
		var cur_player = this.players[i];
		if(cur_gamescore!== null && cur_player['data']['score'] !== cur_gamescore)
		{
			--cur_rewardscore;
		}
		if(cur_rewardscore === 1)
			break;
		cur_gamescore = cur_player['data']['score'];
		
		cur_player['score'] = cur_rewardscore;
	}
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['score']};
	});
	final_score.sort(function(a,b){return b['score'] - a['score'];});
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
	var cur_gamescore = null;
	var cur_rewardscore = 10;
	for(var i=0;i<this.players.length;++i)
	{
		var cur_player = this.players[i];
		if(cur_gamescore!== null && cur_player['data']['score'] !== cur_gamescore)
		{
			--cur_rewardscore;
		}
		if(cur_rewardscore === 1)
			break;
		cur_gamescore = cur_player['data']['score'];
		
		cur_player['score'] = cur_rewardscore;
	}
	
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['score']};
	});
	final_score.sort(function(a,b){return b['score'] - a['score'];});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
};

exports.GeoGame = GeoGame;

var MazeGame = function() {
	GameBase.call(this);
	this.name = "Left or Right?";
	this.codename = "leftright";
	this.duration = 1000*60;
};

util.inherits(MazeGame, GameBase);

MazeGame.prototype.getStartData = function(){
	return {
		deep:0,
		directions:'LRRLRRLRLLRLRRLLLLRLRLLRLLRLLRRLLRRLLLRLRLLRRLRLRLLRLRLLRLLRRLRLLRLLRRRLRRRLRLRLLRLRLLRLL',
		curdeep:0
	};
};

MazeGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		console.log(email, 'Input direction',input);
		if(p['data']['directions'][p['data']['curdeep']] === input)
		{
			p['data']['curdeep']+=1;
			 if(p['data']['curdeep']> p['data']['deep'])
				 p['data']['deep'] = p['data']['curdeep'];
			 return ['C',input]; //Continue
		}
		else
		{
			p['data']['curdeep'] = 0;
			return ['F', input];
		}
	}
	return ['E', -1]; //Ended
};

MazeGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return b['data']['deep'] - a['data']['deep'];});
	var cur_gamescore = null;
	var cur_rewardscore = 10;
	for(var i=0;i<this.players.length;++i)
	{
		var cur_player = this.players[i];
		if(cur_gamescore!== null && cur_player['data']['deep'] !== cur_gamescore)
		{
			--cur_rewardscore;
		}
		if(cur_rewardscore === 1)
			break;
		cur_gamescore = cur_player['data']['deep'];
		
		cur_player['score'] = cur_rewardscore;
	}
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['deep']};
	});
	final_score.sort(function(a,b){return b['score'] - a['score'];});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
};

exports.MazeGame = MazeGame;

var LoremGame = function() {
	GameBase.call(this);
	this.name = "Lady fingers";
	this.codename = "lorem";
	this.duration = 2000*60;
};

util.inherits(LoremGame, GameBase);

LoremGame.prototype.getStartData = function(){
	return {
		score:0,
		lorem:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vitae dui sed risus finibus porta vel id enim. Maecenas lacinia orci risus, id iaculis odio dictum eu. Etiam diam arcu, vulputate bibendum sodales quis, rhoncus eget dui. Pellentesque vestibulum nulla vitae arcu tristique, ut vestibulum ipsum tempor. Nam tempus convallis erat sed maximus. Aliquam lacinia finibus dui. Praesent neque nunc, tempor at diam vel, convallis vestibulum nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam accumsan vitae mi sed imperdiet. Nulla eget ex et justo vestibulum pulvinar a sollicitudin ligula. Sed fringilla mattis posuere. In hac habitasse platea dictumst. Morbi et sem eget neque pretium dapibus. In condimentum vulputate risus, sit amet mattis tellus varius et. Nullam sed mauris ac mi ultrices ultricies eget et magna. Praesent porta faucibus velit sed facilisis. In sollicitudin odio quis ante gravida maximus. Aenean bibendum tortor id accumsan rhoncus. Nunc non orci massa. Curabitur leo augue, varius vel est et, pulvinar volutpat mi. Quisque dignissim ex sed scelerisque porta. Donec quis nulla cursus, finibus tellus in, malesuada risus. Nam a eros in magna iaculis aliquet ac non mauris. Curabitur ullamcorper mauris quis lorem semper, ut gravida massa elementum. Phasellus id fermentum arcu, at eleifend diam. Curabitur egestas orci accumsan lectus dictum euismod. Integer quis libero a lorem congue luctus. Praesent volutpat, sapien at feugiat malesuada, massa lorem aliquet risus, et aliquet tortor turpis imperdiet mauris. Curabitur placerat, sapien interdum fermentum bibendum, dui diam porta risus, sit amet tincidunt quam lorem in neque. Sed dictum, libero ac aliquam ullamcorper, leo est porta enim, sed egestas dui lectus sit amet lacus. Sed aliquam leo at posuere facilisis. Quisque auctor nunc in ligula semper congue. Ut condimentum mi rhoncus nunc tempus lobortis. Nulla laoreet lacus quis nisl laoreet volutpat. Vestibulum condimentum commodo quam, at malesuada felis vulputate in. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi viverra gravida tellus id aliquet. Nunc congue urna sit amet neque placerat, sed varius elit efficitur. Etiam quam ex, accumsan sit amet dapibus vel, mollis ac augue. Donec consectetur dapibus commodo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque sit amet ipsum leo. Aenean vitae scelerisque magna, vitae porttitor enim. Nam efficitur in libero ut consectetur. Morbi justo ante, faucibus et diam a, tincidunt aliquet enim. Vivamus ultrices consequat sem et venenatis. Suspendisse ultrices nisi vel pretium suscipit. Nulla eleifend enim magna, sit amet imperdiet risus pharetra ac. Mauris sit amet sapien tempus, gravida leo eget, vestibulum tortor. Fusce ultrices pharetra suscipit. Donec et euismod nisl. Vivamus orci enim, tempus et lobortis ac, consectetur non mi. Sed enim sapien, ullamcorper vitae rutrum varius, vulputate eu justo. Fusce non finibus ligula, nec mattis sapien. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In hac habitasse platea dictumst. Phasellus venenatis aliquam velit tristique sodales. Nam ac elit diam. Donec venenatis tellus quis varius hendrerit. Duis tempus tellus id justo ultricies aliquam. Integer sagittis eget risus eget mollis. Mauris tristique nulla id erat consectetur, et vestibulum lacus rutrum. Maecenas sodales arcu quis leo pretium pulvinar. Duis dapibus augue ante, vitae pellentesque mauris hendrerit in. Mauris cursus felis ac ligula pulvinar egestas. Fusce a mauris dolor. Phasellus non sem at leo ornare ultricies vitae ac sapien. Quisque enim est, auctor et blandit ac, fringilla vel dolor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras maximus tortor augue, at mattis felis suscipit vitae. Nunc consectetur orci ac arcu aliquet, nec pretium massa commodo. Integer vel fringilla nibh. Suspendisse in mi ac ex consequat dapibus at vel libero. Nulla a mi eget metus gravida eleifend sit amet quis mauris. Suspendisse vulputate eget ante a pulvinar. In scelerisque, neque eget vestibulum sollicitudin, lorem neque ornare ante, sit amet placerat odio magna sed leo. Phasellus rutrum a dolor id cursus. Integer interdum dictum justo et elementum. Nam ac lectus leo. Cras luctus, sem et porttitor fermentum, lacus purus pharetra orci, non aliquet leo mi non tellus. Integer consequat augue at sagittis semper. Morbi iaculis, nisi eu laoreet iaculis, dolor ex rutrum arcu, placerat ultricies ante tortor vitae quam. Ut hendrerit sem tellus, id tincidunt ex placerat in. Sed finibus ac sapien quis pharetra. Etiam at eleifend lacus. Curabitur posuere maximus condimentum. Cras convallis sapien a turpis sollicitudin lobortis. Suspendisse potenti. Nullam et dapibus augue, ac tristique ex. Sed aliquam placerat magna, vel varius turpis sagittis a. Donec tincidunt, velit vitae vehicula placerat, justo ante malesuada nulla, non porttitor magna lacus ut purus. Aliquam euismod lacus vitae ligula sodales facilisis. Donec mattis arcu in nunc mattis bibendum. Donec id rutrum mauris, sit amet hendrerit velit. Vestibulum eleifend, leo ut tempor congue, risus tortor ultrices ante, nec feugiat nisl justo at purus. Duis nulla metus, ultrices ac egestas eu, interdum nec quam. Nulla facilisi. Vivamus non fermentum dolor, nec elementum nisi. Vestibulum in lectus in quam pulvinar finibus id id lectus. Nullam felis enim, sodales id lacus sed, vulputate semper ligula. Nam eget cursus nunc. Sed dui lectus, congue in lacus vitae, venenatis elementum sem. Proin at erat vitae neque blandit cursus. Ut sed mauris tempor, semper turpis in, gravida leo. Duis gravida ac libero in luctus. Phasellus at bibendum turpis. Etiam at ex orci. Donec ultricies ligula vitae ultrices ultrices. Quisque ullamcorper risus est, vel tincidunt leo semper eget. Suspendisse potenti. Praesent vel ante sed tellus vestibulum ultricies. Curabitur fringilla at turpis a sollicitudin. Aenean porta lacus nunc, nec dignissim tortor facilisis a. Pellentesque tincidunt nisl ac ornare vulputate. Nunc magna elit, maximus sit amet ante vel, auctor dapibus ipsum. Nam sit amet ornare ex. Sed commodo enim quis dolor auctor venenatis. Nulla justo tortor, ultrices non mollis in, hendrerit tristique ante. Praesent accumsan lobortis erat nec hendrerit. Mauris id dapibus dolor. Integer ut velit fermentum, tristique quam ut, commodo odio. Phasellus dictum metus eu hendrerit lobortis. Duis sollicitudin mi risus. Fusce a justo molestie, volutpat turpis eu, lobortis enim. Suspendisse cursus est imperdiet erat tincidunt, vitae dignissim magna molestie. Fusce porttitor massa dictum eros sollicitudin, sit amet dignissim nunc euismod. Proin eget mi hendrerit, blandit augue sit amet, blandit neque. Ut molestie libero quis nisi ultricies sollicitudin. Duis suscipit sapien arcu, et mollis ante rutrum ac. Cras et lectus venenatis, ullamcorper justo vel, efficitur augue. Proin eu mattis nisl. Morbi aliquet ullamcorper est hendrerit maximus. Aliquam porta nisi nibh, eu feugiat est pretium vulputate. Mauris convallis eleifend lacus a lacinia. Duis eget tempus tortor, ut mollis purus. Mauris mollis fringilla nulla sed maximus. Sed ut interdum justo. Aliquam imperdiet, magna vitae placerat ultricies, ante lectus rhoncus massa, vel facilisis nibh velit non tellus. Donec elementum egestas nibh, sed vehicula sapien egestas feugiat. Donec iaculis commodo nulla, nec volutpat odio ultrices a. Donec sit amet risus mattis, vestibulum nibh eget, tempus odio. Duis et ante sit amet mi malesuada rutrum ut vitae neque. Donec euismod elit varius justo sollicitudin, vitae malesuada magna pellentesque. Quisque purus erat, viverra ut cursus at, feugiat in dui. Proin vitae erat consectetur, pulvinar eros sed, vulputate orci. Nam facilisis rutrum dapibus. Praesent ullamcorper aliquet luctus.'
	};
};

LoremGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		console.log(email, 'Input letter',input);
		if(p['data']['lorem'][0] === input)
		{
			p['data']['score']+=1;
			p['data']['lorem']=p['data']['lorem'].substr(1);
			
			return ['C',input]; //Continue
		}
		else
		{
			p['data']['score'] -= 0.5;
			return ['F', input];
		}
	}
	return ['E', -1]; //Ended
};

LoremGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return b['data']['score'] - a['data']['score'];});
	var cur_gamescore = null;
	var cur_rewardscore = 10;
	for(var i=0;i<this.players.length;++i)
	{
		var cur_player = this.players[i];
		if(cur_gamescore!== null && cur_player['data']['score'] !== cur_gamescore)
		{
			--cur_rewardscore;
		}
		if(cur_rewardscore === 1)
			break;
		cur_gamescore = cur_player['data']['score'];
		
		cur_player['score'] = cur_rewardscore;
	}
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['score']};
	});
	final_score.sort(function(a,b){return b['score'] - a['score'];});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
};

exports.LoremGame = LoremGame;

var DanceGame = function() {
	GameBase.call(this);
	this.name = "Dance Dance Revolution";
	this.codename = "dance";
	this.duration = 2000*60;
};

util.inherits(DanceGame, GameBase);

DanceGame.prototype.getStartData = function(){
	return {
		score:0,
		steps:'LDLRUUULLDDUUDRDRRUURULLRDDRLUUURULULRUDRRURDLRDUULRULLDDLLDUULLDUDLDLLDRDRDRDURURRURDLULRRULRDLRUULURDUULLDDDUULRLULLLLRDLRUUDRULUDDLUURLRLUDDLUUDLRRDDRUDUULDLLLDLDLRRRRDUDLRUURDRLDLRDDDDDULRLUUDLDLLLLUULUDURRLURURRRRRRUUDRDURDLURLRDRLRRLURLLDUDUDURRRLRUUDLDUDDLLUUUUDUUULLLDRRLRRDULDLDRUUULDDUULRDUUDLDLLUDDLDUUURUUDDLLDRLULDRULDUDRRRRDLLRLUURUDLLRLURDLDUUUDURRRDRLRDUDRLRLLDDLRLDUDDURRRDRDLLUDDDLRURDLDDDLDDRDDDULDRLRURDDLDRLUUULURRURRUDURUURLLUDDLUURURLLRRURDLDDDDURLRURLDLRRRLDULLURDRRURDRDLRLDLDLLLDULUDURRLUULLULLLUDULDLDUDRDUUDRLULDDLDRDLDLRLUUDLRLDDDUDULURRLRDRDRRLLURDRRLUURRDULLRDDRUUDUUDLRUDDULDLULLRDLLUURLRULULUULDRDRLRRDUUDDRRLULURULDDRDRUURLDULULURLURDUURDRRRLDRLULURRDLRRDLRRDDLUURDULUDUUUUDDRUUURDDRULDURDDLDDRURRDLDDDRLRUDRRRLDULDRLRUDLRULDULUDLDDRDLRLULDDUUULLURUDRDLRDLDLLLRLRDRRDRLRRRUDRRLRLRLURURLLRLUUUDUDLURURDUDDURURRDRDDRRRRDRDRRUUURRDLRUURRRLRLDRRURDLRUURDUDULDLUDDURURUURLLLRRURDURLUDUUUDRRRDUULDURUULLDDULLRRLRLDUDDUULDDUURRDLDLLDLULRLLDUDLLDLRDDRUUDLURDUDDUDDDLUDRUURLULUDDDURUDDLUULDDDDRLLULDLDDLRRULDDDLDRRLULDLRLLRURDLLLRRLDURRUDURRUUDRDDRUDURDULURRLRLLURDLLUDLLRURUDURUDDURDRRRLLUUDRLURLLLRRLDUDDLLRRLURRURRDLLRDDDLUDDDDLRDDLDRLDRUUDLLLLDDDUDDURLDRDDUDULRLDDDRRRDRDDRDRLLLRRRLDDRRUUULDDLLRDRLUUUDLULRDLRUDLLRDDRRRRRRLRLRULLDDURRLRDUURLRURULRRLLLULRLDURLDLLRRRRDLDRDRLLRRUUUUDRLDRRLRRUUUURUUURLRRRLDLRLRRUDUDRRRRLDLRRRDULURLRRRDULLLLLRLUUDUDDUUULRLUURDDDDDLRLURDDRRLRULULLDLURLLRDRRRRDDRUDRUUUDDLDLDDULDDDLRLRLRRRLUUULUUURLRDUDRUDURLRDLDUDRDLURRLRDDDUDRRDDURDULRDDUULUDLLRLRUURRDLLLDRLLDLULLDLLRULULDRLRDLULRRLDLRLLURURURUDURDRDUUUULDLULDDLUURRLLURLRUULRRDLRLRRURRULLURDUUDURLLRURRLUDUUUULRRDRLLLURRUDDDLURDDDLDDURLRRLLURRLRRRRDDRRDRULDDURUDDLUUUDDDRRLLLUULRRURLDDLDLDRRLUDRRRDLULLDUUURLDRRDRDUURLRLLRRDRURUDDRUDUUURLRDDRRLUDDURRLLLDRDLURUULURUDDLURDLLUUDDLRUDDRULULURURUUDRDRLDLRLULUDDLUDRULDRLRLRRDDLULUUUDRURRULDLDRULUUURRDLRURLLDLDLRRULULRRDUDUULLUDRUDRUURDLDRRDLLDDRDULRDURRURDURLRDRDURULLDDULDDDLRLLLUDDDDLUUDUDDDRUULULRLLLLRDLDRLUDLLLURRRLDRRUDLRUURRRULUUDRLU'
	};
};

DanceGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		console.log(email, 'Input step',input);
		if(p['data']['steps'][0] === input)
		{
			p['data']['score']+=1;
			p['data']['steps']=p['data']['steps'].substr(1);
			
			return ['C',input]; //Continue
		}
		else
		{
			p['data']['score'] -= 0.5;
			return ['F', input];
		}
	}
	return ['E', -1]; //Ended
};

DanceGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return b['data']['score'] - a['data']['score'];});
	var cur_gamescore = null;
	var cur_rewardscore = 10;
	for(var i=0;i<this.players.length;++i)
	{
		var cur_player = this.players[i];
		if(cur_gamescore!== null && cur_player['data']['score'] !== cur_gamescore)
		{
			--cur_rewardscore;
		}
		if(cur_rewardscore === 1)
			break;
		cur_gamescore = cur_player['data']['score'];
		
		cur_player['score'] = cur_rewardscore;
	}
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['score']};
	});
	final_score.sort(function(a,b){return b['score'] - a['score'];});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
};

exports.DanceGame = DanceGame;

var TimerGame = function() {
	GameBase.call(this);
	this.name = "Time me";
	this.codename = "timer";
	this.duration = 3000*60;
};

util.inherits(TimerGame, GameBase);

TimerGame.prototype.getStartData = function(){
	return {
		best_timing:0,
		cur_start:null
	};
};

TimerGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		console.log(email, 'Cur start',p['data']['cur_start']);
		if(p['data']['cur_start'] === null)
		{
			//player starting
			p['data']['cur_start'] = new Date();
			
			return ['C',-1]; //Continue
		}
		else
		{
			//player stopping
			var now = new Date();
			var timing = now.getTime()-p['data']['cur_start'].getTime();
			p['data']['cur_start'] = null;
			if(timing > 10000)
				return ['F', -1];
			else
			{
				if( timing > p['data']['best_timing'])
				{
					p['data']['best_timing'] = timing;
				}
				return ['C', timing];
			}
		}
	}
	return ['E', -1]; //Ended
};

TimerGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return b['data']['best_timing'] - a['data']['best_timing'];});
	var cur_gamescore = null;
	var cur_rewardscore = 10;
	for(var i=0;i<this.players.length;++i)
	{
		var cur_player = this.players[i];
		if(cur_gamescore!== null && cur_player['data']['best_timing'] !== cur_gamescore)
		{
			--cur_rewardscore;
		}
		if(cur_rewardscore === 1)
			break;
		cur_gamescore = cur_player['data']['best_timing'];
		
		cur_player['score'] = cur_rewardscore;
	}
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['best_timing']};
	});
	final_score.sort(function(a,b){return b['score'] - a['score'];});
	final_score.forEach(function(s){s['score']=s['score'].toString().toString().slice(0,-3)+','+s['score'].toString().toString().slice(-3);});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
};

exports.TimerGame = TimerGame;

var CircleGame = function() {
	GameBase.call(this);
	this.name = "Circle line";
	this.codename = "circles";
	this.duration = 2000*60;
};

util.inherits(CircleGame, GameBase);

CircleGame.prototype.getStartData = function(){
	return {
		score:0,
		circles:[[200,250,100],[57,47,100],[262,469,100],[19,103,100],[106,332,99],[276,129,99],[263,228,99],[283,377,98],[499,467,98],[511,371,98],[140,546,97],[520,192,97],[559,44,97],[137,137,96],[29,187,96],[61,397,96],[123,164,95],[108,243,95],[382,309,95],[155,274,94],[180,119,94],[400,443,94],[512,172,93],[217,272,93],[288,328,93],[235,37,92],[196,250,92],[230,382,92],[258,28,91],[21,576,91],[265,111,91],[242,513,90],[568,301,90],[270,454,90],[455,193,89],[65,490,89],[256,350,89],[143,217,88],[81,17,88],[197,223,88],[149,93,87],[182,440,87],[530,448,87],[342,572,86],[233,519,86],[81,276,86],[59,140,85],[582,254,85],[325,152,85],[0,248,84],[447,240,84],[79,375,84],[496,5,83],[87,320,83],[267,167,83],[305,509,82],[43,618,82],[315,476,82],[374,260,81],[437,462,81],[150,134,81],[495,468,80],[336,112,80],[511,530,80],[102,498,79],[581,519,79],[598,59,79],[300,154,78],[400,153,78],[210,515,78],[148,104,77],[577,614,77],[212,94,77],[383,329,76],[602,591,76],[354,443,76],[149,206,75],[474,245,75],[173,508,75],[433,478,74],[262,35,74],[388,376,74],[370,522,73],[349,4,73],[451,479,73],[20,208,72],[458,344,72],[464,372,72],[520,556,71],[32,154,71],[264,595,71],[181,450,70],[525,233,70],[244,208,70],[521,10,69],[389,38,69],[35,613,69],[334,430,68],[304,347,68],[332,613,68],[599,222,67],[372,379,67],[629,61,67],[275,261,66],[88,587,66],[459,137,66],[149,92,65],[356,18,65],[335,634,65],[395,45,64],[113,340,64],[607,360,64],[326,456,63],[487,476,63],[160,300,63],[410,431,62],[240,287,62],[13,367,62],[358,322,61],[622,617,61],[188,564,61],[293,471,60],[27,246,60],[359,25,60],[460,316,59],[50,275,59],[198,238,59],[179,305,58],[440,60,58],[618,247,58],[327,415,57],[630,100,57],[247,73,57],[467,587,56],[160,154,56],[512,6,56],[599,507,55],[359,182,55],[441,220,55],[335,637,54],[221,246,54],[411,328,54],[12,32,53],[435,166,53],[293,1,53],[173,192,52],[14,35,52],[381,264,52],[528,359,51],[81,30,51],[28,102,51],[129,434,50],[39,550,50],[460,350,50],[519,237,49],[380,103,49],[73,463,49],[110,272,48],[4,373,48],[630,487,48],[296,77,47],[97,95,47],[22,246,47],[493,88,46],[146,278,46],[504,338,46],[267,569,45],[539,237,45],[40,403,45],[46,602,44],[565,583,44],[482,527,44],[337,412,43],[285,603,43],[153,421,43],[348,258,42],[22,318,42],[16,451,42],[499,274,41],[9,353,41],[399,413,41],[182,118,40],[226,0,40],[635,515,40],[38,559,39],[581,28,39],[367,68,39],[207,455,38],[272,482,38],[97,276,38],[30,488,37],[547,66,37],[22,583,37],[565,345,36],[652,563,36],[225,398,36],[546,383,35],[388,556,35],[379,597,35],[196,43,34],[394,582,34],[221,533,34],[158,93,33],[369,239,33],[480,127,33],[325,505,32],[43,666,32],[143,135,32],[507,260,31],[171,69,31],[351,571,31],[115,490,30],[399,666,30],[532,670,30],[568,628,29],[541,334,29],[497,24,29],[138,551,28],[604,367,28],[248,75,28],[166,62,27],[185,388,27],[74,409,27],[609,175,26],[606,124,26],[165,7,26],[215,614,25],[109,323,25],[280,518,25],[444,478,24],[29,321,24],[202,104,24],[1,518,23],[321,311,23],[675,74,23],[389,315,22],[658,655,22],[386,229,22],[591,338,21],[506,333,21],[389,403,21],[144,80,20],[105,3,20],[369,198,20],[133,212,19],[327,623,19],[354,52,19],[431,529,18],[178,356,18],[499,260,18],[460,111,17],[518,301,17],[474,40,17],[8,62,16],[661,317,16],[242,564,16],[348,512,15],[241,114,15],[553,685,15],[104,624,14],[524,60,14],[421,262,14],[9,72,13],[512,403,13],[366,89,13],[330,255,12],[487,143,12],[322,662,12],[374,626,11],[322,104,11],[481,497,11],[231,421,10],[12,390,10],[373,355,10],[471,173,9],[443,661,9],[160,190,9],[185,650,8],[246,358,8],[215,334,8],[458,431,7],[377,653,7],[689,238,7],[667,148,6],[388,646,6],[231,396,6],[331,649,5],[511,89,5],[125,664,5],[620,363,4],[376,543,4],[114,249,4],[447,154,3],[196,340,3],[441,146,3],[100,361,3],[583,464,3],[388,22,3],[535,62,3],[147,270,3],[405,246,3]]
	};
};

CircleGame.prototype.handle = function(email, input){
	if(this.started)
	{
		var p = this.prehandle(email,input);
		if(input === 'F')
		{
			p['data']['score'] -= 0.4;
			return ['F',-1]; //Fail
		}
		else
		{
			p['data']['score'] += 1;
			p['data']['circles'].shift();
			return ['C', p['data']['circles'][0]];
		}
	}
	return ['E', -1]; //Ended
};

CircleGame.prototype.stop = function() {
	GameBase.prototype.stop.call(this);
	this.players.sort(function(a,b){return b['data']['score'] - a['data']['score'];});
	var cur_gamescore = null;
	var cur_rewardscore = 10;
	for(var i=0;i<this.players.length;++i)
	{
		var cur_player = this.players[i];
		if(cur_gamescore!== null && cur_player['data']['score'] !== cur_gamescore)
		{
			--cur_rewardscore;
		}
		if(cur_rewardscore === 1)
			break;
		cur_gamescore = cur_player['data']['score'];
		
		cur_player['score'] = cur_rewardscore;
	}
	final_score =  this.players.map(function(p){
		return {email: p.email, score: p.data['score']};
	});
	final_score.sort(function(a,b){return b['score'] - a['score'];});
	var gamescore = new GameScore();
	gamescore.name = this.name;
	gamescore.codename = this.codename;
	gamescore.scores = final_score;
	gamescore.save();
	return gamescore;
};

exports.CircleGame = CircleGame;