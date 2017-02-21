$(document).ready(function() {

  $('.notification_request').click(function(){
		Notification.requestPermission( function(status)
		{
			console.log("Notification status:", status);
			var n = new Notification("IO Challenge", {body: "Notifications are enabled"});
		});
	})

});