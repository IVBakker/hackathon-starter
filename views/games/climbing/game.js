onAnswer = function(status, height)
{
	if(status === 'F')
	{
		$('#THECLIMBALERT').show();
		setTimeout(function(){$('#THECLIMBALERT').hide();},500);
		
	}
	$('#THECLIMBBLOCK').css('bottom',height+'px');
};

$(document).keydown(function(e){
		e.preventDefault();
    if (e.keyCode === 37 || e.keyCode === 39)
		{
			var map_arrow = {
				37:'L',
				39:'R'
			};
			console.log("Arrow", map_arrow[e.keyCode]);
			sendInput(map_arrow[e.keyCode]);
		}
});