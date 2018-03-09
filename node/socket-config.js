var users = []
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
	module.getServers = _getServers

	return module
}

function _getUsers() { return users }
function _getServer() { return server }
function _getServers() { return dsApp.servers }

function _broadcastMessage(socket, event, msg) {
	console.log('Broadcasting event '+ event + (msg !== undefined ? " - "+msg : ''))

	_getUsers().forEach(function(user) {
		if (user.alias === socket.alias) return
		var data = { alias: user.alias, event: event, data: { message: msg } }
		user.socket.write(JSON.stringify(data))
	})

	_getServers().forEach(function(server) {
		if (server.alias === socket.alias) return
		var data = { alias: server.alias, event: event, data: { message: msg } }
		server.socket.write(JSON.stringify(data))
	})
}

function _broadcastEvent(socket, data) {
	function iterateList() {
		this.forEach(function(element) {
			if (socket && (socket.alias === element.alias)) return
			element.socket.write(JSON.stringify(data))
		})
	}

	//iterateList.call(_getUsers())
	iterateList.call(_getServers())
}

function _configureServer(socket) {
	
	socket.write(_getServerInfo())
	
	socket.on('close', function() { _userDrop(socket) })
	socket.on('data', function(data) {
		_processEvent(socket, JSON.parse(data))
	})
	socket.on('error', function() {
		_userDrop(socket)
	})
}

function _processEvent(socket, data) {
	var event = data.event
	if (event === 'join') {
		//Check whether there's already a connection between the two instances
		socket.alias = data.alias
		//Means it will be a server instance, otherwise it'll be just a client connection
		if (data.ip) {
			//Auto Connect to the server
			dsApp.client.connectToServer(data.ip, data.port)

			socket.write(JSON.stringify({event: 'accepted'}))
			//TODO add server instance under the menu 'servers'
			dsApp.addInstance(data.alias, data.ip, data.port)
		} else {
			_getUsers().push({ socket: socket })
		}
	} else if (event === 'userlist') {
		_sendConnections(socket)
	}
}

function _getServerInfo() {
	return JSON.stringify({ event: 'server-info', data: { alias: dsApp.instanceAlias, ip: 'localhost', port: dsApp.myPort } })
}

function _sendConnections(socket) {
			
	function filter() {
		var self = this
		var list = self.filter(element => { if (element.socket.alias != socket.alias) return Object.assign({}, element) })
		return list
	} 

	function wipeSocket() { this.forEach(element => delete element.socket )	}
	var servers = filter.call(_getServers())
	var users = filter.call(_getUsers())

	wipeSocket.call(servers)
	wipeSocket.call(users)

	var data = { 
		event: 'userlist',
		data: {
			users: users, 
			servers: servers 
		} 
	}

	socket.write(JSON.stringify(data))
}

function _userDrop(socket) {
	var iterate = function(list) {
		this.forEach(obj => {
			list.splice(list.indexOf(obj), 1)
		})
	}
	var obj = _getUsers().filter((user) => { if (user.alias == socket.alias) return user })
	iterate.call(obj, _getUsers())

	obj = _getServers().filter((server) => { if (server.alias == socket.alias) return server })
	iterate.call(obj, _getServers())

	//_broadcastEvent(socket, 'leave')
}