onAnswer = function(status, position)
{
	if(status === 'F')
	{
		$('#THEGEOALERT').show();
		setTimeout(function(){$('#THEGEOALERT').hide();},1000);
	}
	else
	{
		$("#gamecontainer").hide();
		panorama.setPosition(position);
		$("#gamecontainer").show();
	}
};

$('#THEGEOFORM').submit(function(event){
	var answer = $('#THEGEOINPUT').val().trim().toLowerCase().replace(/ /g,'');
	if (answer.length > 0)
	{
		sendInput(answer);
		$('#THEGEOINPUT').val('');
	}
	event.preventDefault();
	return false;
});

