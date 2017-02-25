function getCookie(key) {
	var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
	return keyValue ? keyValue[2] : null;
}

$(document).ready(function() {

	function setCookie(key, value) {
			var expires = new Date();
			expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
			document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
	}

	
	$('.notification_request').click(function(){
		Notification.requestPermission( function(status)
		{
			console.log("Notification status:", status);
			var n = new Notification("GG 2017", {body: "Notifications are enabled"});
		});
	});
	$("#alertoff").on('change', function () {
		console.log('Alert play cookie OFF');
		setCookie('playalert', 'F');
	});
	$("#alerton").on('change', function () {
		console.log('Alert play cookie ON');
		setCookie('playalert', 'Y');
	});
	
	if(getCookie('playalert') === 'Y')
	{
		$("#alertoff").attr('checked',false);
		$("#alerton").attr('checked',true);
	}
});