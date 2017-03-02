var socket = null;
$(document).ready(function()
{
	var STATE = null;
		var socket_url = location.protocol + '//' + location.hostname + ':' + location.port+'/sandbox';
		console.log("SOCKET", socket_url);
		socket = io(socket_url);
		function sendMessage()
		{
				var msg = $('#chat-input').val().trim();
				if(msg.length > 0)
				{
								var send_msg = "\
												<div class='row msg_container base_sent'> \
																<div class='col-md-10 col-xs-10'>\
																				<div class='messages msg_sent'>\
																								<p>"+escapeHtml(msg)+"</p>\
																								<time>"+(new Date()).toLocaleString()+"</time>\
																				</div>\
																</div>\
																<div class='col-md-2 col-xs-2 avatar'>\
																				<img src='"+$('#PROFILEPIC').attr('src')+"'\
																								 class=' img-responsive'>\
																</div>\
												</div>";
						console.log("Sending", msg);
						socket.emit('chat message', msg);
						$('#chat-input').val('');
						$('.msg_container_base').append(send_msg);
						var height = $(".msg_container_base")[0].scrollHeight;
						$(".msg_container_base").scrollTop(height,"slow");
				}
		}
		$('.chat-input').keyup(function(e){
				if(e.keyCode === 13)
				{
						sendMessage();
				}
		});
		$('.chat-btn').on('click', function (e) {
				sendMessage();
		});
		
		socket.on('chat message', function(data)
		{
			$("#favicon").attr("href","favicon_notification.ico");
						var received_msg = "\
										<div class='row msg_container base_receive'> \
														<div class='col-md-2 col-xs-2 avatar'>\
																		<img src='"+data.pic+"'\
																						 class=' img-responsive '>\
														</div>\
														<div class='col-md-10 col-xs-10'>\
																		<div class='messages msg_receive'>\
																						<p>"+data.msg+"</p>\
																						<time>"+(new Date()).toLocaleString()+" - "+data.user+"</time>\
																		</div>\
														</div>\
										</div>";
				$('.msg_container_base').append(received_msg);
				$(".msg_container_base").animate({ scrollTop: $(".msg_container_base")[0].scrollHeight }, "slow");
		});

		$(window).on('focus', function()
		{
			$("#favicon").attr("href","favicon.ico");
		});

		$('.panel-heading span.minim_chat').on('click', function (e) {
				var $this = $(this);
				if (!$this.hasClass('panel-collapsed'))
				{
						$this.parents('.panel').find('.panel-body').slideUp();
						$this.addClass('panel-collapsed');
						$this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
				} else {
						$this.parents('.panel').find('.panel-body').slideDown();
						$this.removeClass('panel-collapsed');
						$this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
				}
		});
		onAnswer = null;
		socket.on('state', function(data)
		{
			var new_html = data.html;
			var new_js = data.js;
			STATE = data.state;
			
			console.log('received:', data);
			onAnswer = null;
			$("#gamecontainer").fadeOut("slow", function()
			{
				$("#gamecontainer").css('visibility','visible');
				$("#gamecontainer").html(new_html);
				eval(new_js);
				$("#gamecontainer").fadeIn("slow",function(){
				});
			});
		});
		
		socket.on('page_reload', function(){
				console.log("Reloading page");
				location.reload();
		});
		
		$('.game-create').click(function(){
			console.log('CREATE', $(this).attr('codename'));
			socket.emit('create', $(this).attr('codename'));
		});
		
		function sendInput(input)
		{
			if(STATE === 'PLAY')
				socket.emit('input', input);
		}
		
		socket.on('answer', function(data)
		{
			if(onAnswer !== null)
			{
				if (data[0] === 'E')
				{
					STATE = 'OUTPLAY';
					$("#gamecontainer").fadeOut("slow", function(){
						$("#gamecontainer").html('<h1>You finished the game, waiting for it to finish</h1>');
						$("#gamecontainer").fadeIn("slow");
					});
				}
				else
					onAnswer(data[0], data[1]);
			}
		});

});