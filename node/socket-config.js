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
	module.showServers = _showServers

	return module
}

function _getUsers() { return users }
function _getServer() { return server }
function _getServers() { return dsApp.servers }
function _showServers() { dsApp.log.info(_getServers()) }

function _broadcastMessage(socket, event, msg) {
	dsApp.log.info('Broadcasting event '+ event + (msg !== undefined ? " - "+msg : ''))

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
	
	socket.on('data', function(data) { _processEvent(socket, JSON.parse(data))	})
	socket.on('error', function() { _userDrop('Server', socket)	})
}

function _processEvent(socket, data) {
	var event = data.event
	if (event === 'clientinfo') {
		//Check whether there's already a connection between the two instances
		socket.alias = data.alias
		dsApp.log.info('New instance connected '+ data.alias + ' ('+data.ip+':'+data.port+')')
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
			
	function map() {
		return this.map(el => { 
			if (el.socket.alias != socket.alias) 
				return { alias: el.alias, ip: el.ip, port: el.port }
		})
	} 

	var servers = map.call(_getServers())
	var users = map.call(_getUsers())

	var data = { 
		event: 'userlist',
		data: {
			servers: servers 
		} 
	}

	socket.write(JSON.stringify(data))
}

function _userDrop(type, socket) {
	var iterate = function(list) {
		this.forEach(obj => {
			list.splice(list.indexOf(obj), 1)
		})
	}
	var obj = _getUsers().filter((user) => { if (user.alias == socket.alias) return user })
	iterate.call(obj, _getUsers())

	obj = _getServers().filter((server) => { if (server.alias == socket.alias) return server })
	iterate.call(obj, _getServers())

	dsApp.log.error('['+type+'] Instance '+socket.alias+' dropped')
	//_broadcastEvent(socket, 'leave')
}