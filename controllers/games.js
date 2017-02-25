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