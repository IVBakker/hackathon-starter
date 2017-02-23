onAnswer = function(count)
{
	console.log('ANSWER RECEIVED', count);
	$('#THEBUTTONC').text(count);
};

$('#THEBUTTON').click(function(){
	console.log("CLICK");
	sendInput('CLICK');
});