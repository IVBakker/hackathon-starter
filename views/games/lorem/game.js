onAnswer = function(status, problem)
{
	if(status === 'F')
	{
		$('#THELOREMALERT').show();
		setTimeout(function(){$('#THELOREMALERT').hide();},500);
	}
	else
	{
		$('#THELOREMTEXT').text($('#THELOREMTEXT').text().substr(1));
	}
};

$('#THELOREMINPUT').on('input', function(event){
	var input = $('#THELOREMINPUT').val();
//	console.log("INPUT", input);
	if (input.length > 0)
	{
		if(input.length > 1)
		{
			$('#THELOREMCHEAT').show();
			setTimeout(function(){$('#THELOREMCHEAT').hide();},500);
		}
		else
		{
			sendInput(input);
		}
		$('#THELOREMINPUT').val('');
	}
	event.preventDefault();
	return false;
});