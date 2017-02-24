onAnswer = function(status, count)
{
	$('#THEBUTTONC').text(count);
};

$('#THEBUTTON').click(function(){
	console.log("CLICK");
	sendInput('CLICK');
});