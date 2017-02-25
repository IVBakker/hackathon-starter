onAnswer = function(status, direction)
{
	var gate_color='success';
	if(status === 'F')
	{
		$('#THECALCALERT').show();
		setTimeout(function(){$('#THECALCALERT').hide();},1000);
		gate_color='danger';
	}
	var button = $('#THECONTENTLEFTBUTTON');
	if (direction === 'R')
	{
		button = $('#THECONTENTRIGHTBUTTON');
	}
	button.removeClass('btn-default').addClass('btn-'+gate_color);
	setTimeout(function(){button.removeClass('btn-'+gate_color).addClass('btn-default');},500);
};

$('#THELEFTBUTTON').click(function(){
	sendInput('L');
});

$('#THERIGHTBUTTON').click(function(){
	sendInput('R');
});