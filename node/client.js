var net = require('net')
var serverPort
var clients = []

module.exports = function(serverPortConfig) {
	var module = {}
	serverPort = serverPortConfig

	module.connectToServer = _connectToServer

	return module
}

function _getUsers() { return dsApp.users }
function _getServers() { return dsApp.servers }

/* Client Side */
function _connectToServer(ip, port) {
	var ports = _getServers().filter(m => { if (m.port === port && m.ip === ip) return m })
	var client = net.Socket()
	if (!ports.length) {
		client.connect(port, ip, function() {
			console.log('Connected as client on ' + client.remoteAddress+':'+client.remotePort)
			client.setKeepAlive(true)
		})

		client.on('data', function(data) {
			dsApp.log.info('['+client.alias+' ('+ip+':'+port+')]: '+data)
			_processEvent(data, client)
		})

		client.on('close', (err) => { 
			dsApp.socketModule.userDrop('Client', client)
			dsApp.removeInstance(client.alias, client.remoteAddress, client.remotePort)
			console.log('Client connection ended') 
		})

		client.on('error', (err) => { 
			if (err.code == 'ECONNREFUSED')
				dsApp.log.error('Connection has been refused for given address and port')
			else
				dsApp.log.error('An unexpected error occurred and the connection was closed')
		})
	}

	return client
}

function _getClientInfo() {
	return JSON.stringify({ event: 'clientinfo', ip: 'localhost', port: serverPort, alias: dsApp.instanceAlias})
}

function _processEvent(data, client) {
	var content = JSON.parse(data)
	var data = content.data
	
	// Message received after connecting to a given server
	if (content.event == 'server-info') {
		var server = data
		client.alias = data.alias
		server.socket = client
		_getServers().push(server)
		client.write(_getClientInfo())
	} else if (content.event == 'accepted') {
		// Ask for user list
		client.write(JSON.stringify({event: 'userlist'})) 
	} else if (content.event == 'userlist') {
		dsApp.users = _getUsers().concat(data.users)
		data.servers.forEach(server => {
			// Map servers port in order to discover if there's some server with that given port
			if (server)
				var socket = _connectToServer(server.ip, server.port)
		})
	}
}