var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userCount = 0;

io.on('connection', function( socket ){
	
	var loggedIn = false;
	
	socket.on('login', function( nickname ){
		
		socket.join('chat');
		
		var onChatMessage = function( message ){
			io.to('chat').emit('chat:message', {
				"from": nickname,
				"content": message
			});
		};
		
		socket.once('chat:checkin', function( ){
			loggedIn = true;
			userCount++;
			
			socket.on('chat:message', onChatMessage);
			io.to('chat').emit('chat:status', userCount);
		});
		
		socket.once('chat:logout', function( ){
			socket.leave('chat');
			socket.removeListener('chat:message', onChatMessage);
			
			loggedIn = false;
			userCount--;
			
			socket.emit('chat:leave');
			io.to('chat').emit('chat:status',userCount);
		});
		
		socket.emit('login:accepted', nickname);
	});
	
	socket.on('disconnect', function( socket ){
		if(loggedIn === true) {
			userCount--;
			io.to('chat').emit('chat:status',userCount);
		}
	});
	
});

app.use('/',express.static(__dirname + '/client'));

http.listen(8080, function(){
	console.log('99% rodando, mas aquele 1%...');
});
