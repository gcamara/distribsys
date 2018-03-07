var socketServer
var webSocketServer = require('websocket').server

module.exports = function(opt) { 
	var module = {}
	socketServer = opt
	configureServer()

	module.webSocket = function() {
		return webSocketServer
	}

	module.configureServer = configureServer

	return module
}


function configureServer() {
	if (socketServer) {
		console.log('Starting WebSocket Server')
		var wsServer = new webSocketServer({ httpServer: socketServer })
		wsServer.on('request', function(request) {
			var socket =  request.accept(null, request.origin)
			configureSocket(socket)
		})
	}
}