onAnswer = function(status, position)
{
	if(status === 'F')
	{
		$('#THECIRCLEALERT').show();
		setTimeout(function(){$('#THECIRCLEALERT').hide();},500);
	}
	else
	{
		var circle = $('#THECIRCLE');
		circle.css('width', position[2]);
		circle.css('height', position[2]);
		circle.css('left', position[0]);
		circle.css('top', position[1]);
	}
};

$('#THECIRCLEBACKGROUND').click(function(e){
	if (e.target !== this)
    return;
	sendInput('F');
});

$('#THECIRCLE').click(function(){
	console.log('CIRCLE');
	sendInput('C');
});

function gen(){
	function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	var aa =[[200,250,100]];
	
	for(var i=0;i<300;i++)
	{
		var size = Math.max(3,100-Math.floor(i/3));
		var x = getRandomInt(0,700-size);
		var y = getRandomInt(0,700-size);
		aa.push([x,y,size]);
	}
	
	console.log(JSON.stringify(aa));
}