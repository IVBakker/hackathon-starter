onAnswer = function(status, problem)
{
	if(status === 'F')
	{
		$('#THECALCALERT').show();
		setTimeout(function(){$('#THECALCALERT').hide();},1000);
	}
	else
	{
		$('#THECALC').text(problem);
	}
};

$('#THECALCFORM').submit(function(event){
	var answer = $('#THECALCINPUT').val().trim();
	if (answer.length > 0)
	{
		answer = Number(answer);
		if(!isNaN(answer))
		{
			sendInput(answer);
		}
		$('#THECALCINPUT').val('');
	}
	event.preventDefault();
	return false;
});