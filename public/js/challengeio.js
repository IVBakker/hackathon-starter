$(document).ready(function() {
  console.log("I'm ready");
  var socket_url = location.protocol + '//' + location.hostname + ':' + location.port;
  console.log("URL", socket_url);
  var socket = io(socket_url);
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
});