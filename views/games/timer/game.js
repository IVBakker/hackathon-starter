onAnswer = function(status, duration)
{
	var start_flag = true;
	if(status === 'F')
	{
		//Stopped after 10secs
		$('#THETIMERALERT').show();
		setTimeout(function(){$('#THETIMERALERT').hide();},500);
		start_flag = false;
	}
	else if(duration !== -1)
	{
		//Stopped before 10secs
		start_flag = false;
		sduration = duration.toString();
		$('#THETIMERINFO').text(sduration.toString().slice(0,-3)+','+sduration.toString().slice(-3));
	}
	var button = $('#THECONTENTTIMERBUTTON');
	if(start_flag)
	{
		button.removeClass('btn-default').addClass('btn-warning');
		button.text('Stop');
	}
	else
	{
		button.removeClass('btn-warning').addClass('btn-default');
		button.text('Start');
	}
};

$('#THETIMERBUTTON').click(function(){
	sendInput('Press');
});