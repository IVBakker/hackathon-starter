onAnswer = function(status, count)
{
	$('#THEBUTTONC').text(count);
};
var isKeyPress = false;

$(document).keydown(function(e){
	if (e.keyCode === 13)
	{
		isKeyPress = true;
	}
});

$(document).keyup(function(e){
	if (e.keyCode === 13)
	{
		isKeyPress = false;
	}
});

$('#THEBUTTON').click(function(){
	if (!isKeyPress)
	{
		console.log("CLICK");
		sendInput('CLICK');
	}
});