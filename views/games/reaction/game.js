THETIMERFLAG = 'R'; //R ready, W waiting, C click awaited

onAnswer = function(status, wait)
{
	if (status === 'C')
	{
		if(wait === -1)
		{
			THETIMERFLAG = 'C';
			$('#THEREACTIONBUTTONCONTENT').removeClass('btn-success').addClass('btn-warning');
			$('#THEREACTIONBUTTONCONTENT').text('CLICK!');
		}
		else
		{
			$('#THEREACTIONINFO').text(wait[0].toString()+'ms');
			$('#THEREACTIONBUTTONCONTENT').removeClass('btn-warning').addClass('btn-default');
			$('#THEREACTIONBUTTONCONTENT').text('Start');
			REACTIONWAIT = wait[1];
//			console.log('New waiting time', REACTIONWAIT);
			THETIMERFLAG = 'R';
		}
	}
	
};

$('#THEREACTIONBUTTON').click(function(){
	switch(THETIMERFLAG)
	{
		case 'R':
			$('#THEREACTIONBUTTONCONTENT').removeClass('btn-default').addClass('btn-success');
			$('#THEREACTIONBUTTONCONTENT').text('WAIT...');
			THETIMERFLAG = 'W';
			setTimeout(function(){
				sendInput('START');
			}, REACTIONWAIT*1000);
			break;
		case 'W':
			$('#THEREACTIONBUTTONCONTENT').attr('disabled','disabled');
			setTimeout(function(){$('#THEREACTIONBUTTONCONTENT').removeAttr('disabled');},15000);
			$('#THEREACTIONALERT').show();
			setTimeout(function(){$('#THEREACTIONALERT').hide();},15000);
			break;
		case 'C':
			sendInput('STOP');
			break;
	}
});

function gen(){
	function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	var aa =[];
	
	for(var i=0;i<100;i++)
	{
		aa.push(getRandomInt(3,10));
	}
	
	console.log(JSON.stringify(aa));
}