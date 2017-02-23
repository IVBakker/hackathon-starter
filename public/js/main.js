$(document).ready(function() {

  $('.notification_request').click(function(){
		Notification.requestPermission( function(status)
		{
			console.log("Notification status:", status);
			var n = new Notification("GG 2017", {body: "Notifications are enabled"});
		});
	})

});