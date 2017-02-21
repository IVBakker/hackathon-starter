$(document).ready(function()
{
		var socket_url = location.protocol + '//' + location.hostname + ':' + location.port;
		var socket = io(socket_url);
		function escapeHtml(str) {
				var div = document.createElement('div');
				div.appendChild(document.createTextNode(str));
				return div.innerHTML;
		}
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
																				<img src='http://www.bitrebels.com/wp-content/uploads/2011/02/Original-Facebook-Geek-Profile-Avatar-1.jpg'\
																								 class=' img-responsive '>\
																</div>\
												</div>";
						console.log("Sending", msg)
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
						var received_msg = "\
										<div class='row msg_container base_receive'> \
														<div class='col-md-2 col-xs-2 avatar'>\
																		<img src='http://www.bitrebels.com/wp-content/uploads/2011/02/Original-Facebook-Geek-Profile-Avatar-1.jpg'\
																						 class=' img-responsive '>\
														</div>\
														<div class='col-md-10 col-xs-10'>\
																		<div class='messages msg_receive'>\
																						<p>"+escapeHtml(data.msg)+"</p>\
																						<time>"+(new Date()).toLocaleString()+" - "+data.user+"</time>\
																		</div>\
														</div>\
										</div>";
				$('.msg_container_base').append(received_msg);
				$(".msg_container_base").animate({ scrollTop: $(".msg_container_base")[0].scrollHeight }, "slow");
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

		socket.on('state', function(data)
		{
			var new_html = data.html;
			var new_js = data.js;
			console.log('received:', data);
			$(".page-include").fadeOut("slow", function()
			{
				$(".page-include").css('visibility','visible');
				$(".page-include").html(new_html);
				$(".page-include").fadeIn("slow");
				eval(new_js);
			});
		});
		
		socket.on('page_reload', function(){
				console.log("Reloading page");
				location.reload();
		});

});