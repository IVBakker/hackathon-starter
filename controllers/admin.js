var io;
var gameengine;

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
				{
						io.sockets.emit('page_reload');
						break;
				}
				case 'next':
				{
						gameengine.nextState();
						break;
				}
				default:
		}
		res.end();
};

module.exports = function(_io,_engine)
{
		io = _io;		
		gameengine = _engine;		
		
		return {
				index: index,
				control: control
		};		
};