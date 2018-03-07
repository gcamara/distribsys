var users = []
var servers = []
var net = require('net')
var server

module.exports = function() {
	var module = {}
	server = net.createServer(_configureServer)

	module.broadcastEvent = _broadcastEvent
	module.configureServer = _configureServer
	module.sendConnections = _sendConnections
	module.userDrop = _userDrop
	module.getUsers = _getUsers
	module.getServer = _getServer

	return module
}

function _getUsers() { return users }
function _getServer() { return server }

function _broadcastEvent(socket, event, msg) {
	console.log('Broadcasting event '+ event + (msg !== undefined ? " - "+msg : ''))

	users.forEach(function(user) {
		if (user === socket) return
		var data = {name: socket.name, event: event, message: msg}
		user.sendUTF(stringify(data))
	})
}

function _configureServer(socket) {
	console.log('\nNew client connected!')

	socket.on('close', function() { _userDrop(socket) })
	socket.on('data', function(data) {
		var content = JSON.parse(data)
		//console.log(content)
		var event = 'message'
		if (content.name) {
			socket.name = content.name
			event = 'join'
			users.push(socket)
			sendConnections(socket)
		}
		if (content.ip) {
			servers.push()
		}
	})
	socket.on('error', function() {
		users.splice(users.indexOf(socket), 1)
	})
}

function _sendConnections(socket, users) {
	socket.sendUTF(stringify({ event: 'userlist', data: users }))
}

function _userDrop(socket) {
	users.splice(users.indexOf(socket), 1)
	_broadcastEvent(socket, 'leave', users)
	console.log('User '+socket.name+' dropped')
}