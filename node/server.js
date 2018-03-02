var http = require('http')
var webSocketServer = require('websocket').server
var stringify = require('json-stringify')
var users = []
var serverNumber

var server = http.createServer(function(){})
server.listen(8000, function() {
	console.log('Server listening on port 8000')
})

var wsServer = new webSocketServer({ httpServer: server })
wsServer.on('request', function(request) {
	var socket =  request.accept(null, request.origin)
	configureSocket(socket)
})

function broadcastEvent(socket, event, msg) {
	console.log('Broadcasting event '+ event + (msg !== undefined ? " - "+msg : ''))

	users.forEach(function(user) {
		if (user === socket) return
		var data = {name: socket.name, event: event, message: msg}
		user.sendUTF(stringify(data))
	})
}

function configureSocket(socket) {
	socket.on('close', function() { userDrop(socket) })
	socket.on('message', function(data) {
		var content = JSON.parse(data.utf8Data)
		var event = 'message'
		if (content.name !== undefined) {
			socket.name = content.name
			event = 'join'
			users.push(socket)
			sendConnections(socket)
		}
		broadcastEvent(socket, content.event, content.data)
	})
	socket.on('error', function() {
		users.splice(users.indexOf(socket), 1)
	})
}

function sendConnections(socket) {
	socket.sendUTF(stringify({ event: 'userlist', data: users }))
}

function userDrop(socket) {
	users.splice(users.indexOf(socket), 1)
	broadcastEvent(socket, 'leave')
	console.log('User '+socket.name+' dropped')
}
