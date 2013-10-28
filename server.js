var http 	= require('http'),
	fs		= require('fs'),
	path	= require('path'),
	mime 	= require('mime'),
	chatServer = require('./lib/chat_server.js'),
	cache	= {}; // cache obj 	




function send404(response) {
	console.log('sending 404 response');
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents){
	console.log('send file function');
	response.writeHead(200, {"Content-Type": mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]){
		console.log('found path in cache');
		sendFile(response, absPath, cache[absPath]);
	}else{
		fs.exists(absPath, function(exists){
			if (exists) {
				console.log('path exists');
				fs.readFile(absPath, function (err, data) {
					if (err){
						console.log('can\'t read the file');
						send404(response);
					} else {
						console.log('file found calling to send file function');
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else { //File not found - exists is false
				send404(response);
			}
		});
	}
}


//Creating the Server
var server = http.createServer(function (request, response) { 
	var filePath = false;

	if (request.url == '/') {
		filePath = 'public/index.html';
	}else{
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});


//Start the server
server.listen(3000, function() {
	console.log("Server listening on port 3000");
});

//Start Chat Server
chatServer.listen(server);