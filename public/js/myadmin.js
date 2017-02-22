$(document).ready(function() {
	$('.admin_action').click(function(){
		console.log("Admin action", $(this).attr('key'));
		$.ajax({
				type: "POST",
				url: '/admin/control',
				data: {
						'key':$(this).attr('key'),
						'_csrf':$('#csrf').attr('value')
				}
			});
	});

});