$(document).ready(function() {
	$('.refresh').click(function(){
		console.log("Refreshing people");
		$.ajax({
				type: "POST",
				url: '/admin/control',
				data: {
						'key':'reload',
						'_csrf':$('#csrf').attr('value')
				}
			});
	});

});