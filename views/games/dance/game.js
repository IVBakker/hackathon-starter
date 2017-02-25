onAnswer = function(status, problem)
{
	if(status === 'F')
	{
		$('#THEDANCEALERT').show();
		setTimeout(function(){$('#THEDANCEALERT').hide();},500);
	}
	else
	{
		$('#THEDANCEARROWS').children().first().remove();
	}
};

$(document).keydown(function(e){
    if (e.keyCode > 36 && e.keyCode < 41)
		{
			var map_arrow = {
				37:'L',
				38:'U',
				39:'R',
				40:'D'
			};
			console.log("Arrow", map_arrow[e.keyCode]);
			sendInput(map_arrow[e.keyCode]);
		}
});