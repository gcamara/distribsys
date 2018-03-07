var net = require('net')
var client = net.Socket()
var servers
var serverPort

module.exports = function(serversConfig, serverPortConfig) {
	var module = {}
	
	servers = serversConfig
	serverPort = serverPortConfig

	module.connectToServer = connectToServer

	return module
}

/* Client Side */
function connectToServer(ip, port) {
	var ports = servers.map(m => m.remotePort)

	if (ports.indexOf(port) === -1) {
		client.connect(port, ip, function() {
			console.log('Connected as client on ' + client.remoteAddress+':'+client.remotePort)
			var data = { event: 'join', ip: 'localhost', port: serverPort, time: new Date()}
			client.setKeepAlive(true)
			client.write(JSON.stringify(data))
			servers.push(client)	
		})

		client.on('data', function(data) {
			console.log('Client Received: '+data+' \n')
		})

		client.on('close', (err) => { 
			console.log('Client connection ended') 
		})

		client.on('error', (err) => { 
			console.log('There has been and error')
			console.log(err) 
		})
	}
}