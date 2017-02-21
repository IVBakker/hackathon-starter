var io;

function index(req, res){
	res.render('admin', {
		title: 'Admin'
	});
};

function control(req, res){
		
		console.log("KEY", req.body.key);
		console.log("BODY", req.body);
		switch(req.body.key)
		{
				case 'reload':
						io.sockets.emit('page_reload');
						break;
				default:
		}
};

module.exports = function(_io)
{
		io = _io;		
		
		return {
				index: index,
				control: control
		};		
};