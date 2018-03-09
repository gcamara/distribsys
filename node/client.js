var net = require('net')
var serverPort

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
	var ports = _getServers().filter(m => { if (m.port === port) return m })
	var client = net.Socket()
	if (!ports.length) {
		client.connect(port, ip, function() {
			console.log('Connected as client on ' + client.remoteAddress+':'+client.remotePort)
			client.setKeepAlive(true)
		})

		client.on('data', function(data) {
			console.log('Client Received: '+data+' \n')
			_processEvent(data, client)
		})

		client.on('close', (err) => { 
			console.log('Client connection ended') 
		})

		client.on('error', (err) => { 
			console.log('There has been and error')
			console.log(err) 
		})
	}
	return client
}

function _processEvent(data, client) {
	var content = JSON.parse(data)
	var data = content.data
	
	// Message received after connecting to a given server
	if (content.event == 'server-info') {
		var server = data
		server.socket = client
		server.socket.alias = data.alias
		var ports = _getServers().filter(m => { if (m.port === server.port) return m })

		if (!ports.length) {
			_getServers().push(server)
			var info = { event: 'join', ip: 'localhost', port: serverPort, alias: dsApp.instanceAlias}
			client.write(JSON.stringify(info))
		}
	} else if (content.events == 'accepted') {
		// Ask for user list
		client.write(JSON.stringify({event: 'userlist'})) 
	} else if (content.event == 'userlist') {
		dsApp.users = _getUsers().concat(data.users)
		data.servers.forEach(server => {
			// Map servers port in order to discover if there's some server with that given port
			var socket = _connectToServer(server.ip, server.port)
			socket.alias = server.alias
			server.socket = socket
		})
	}
}