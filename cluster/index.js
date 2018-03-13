var http = require('http')
var express = require('express')
var app = express()
var ip = process.argv[process.argv.indexOf('-a') + 1]
var port = process.argv[process.argv.indexOf('-p') + 1]
var stringify = require('../node/node_modules/json-stringify')
var socketModule = require('../node/socket-config')()
var connection
var timeout = 2000
var maxAttempts = 5
dsApp = {
	servers: [],
	log: console,
	socketModule: socketModule,
	removeInstance: () => {},
	users: [],
	instanceAlias: 'Cluster'
}

app.set('port', process.env.port || 8000)

var clientModule = require('../node/client')(app.get('port'))

app.get('/servers', function(request, response) {
	var servers = []
	dsApp.servers.forEach(server => {
		var sv = {
			ip: server.ip,
			port: server.port,
			alias: server.alias
		}
		servers.push(sv)
	})
	if (servers.length)
		response.send(stringify(servers[0]))
	else
		response.render('404')
})

http.createServer(app).listen(app.get('port'), function() { 
	console.log('Cluster started at port '+app.get('port'))
	console.log('Parameters - A: '+ip+' / P: '+port)
	connection = clientModule.connectToServer(ip, port)
	connection.setKeepAlive(true)
	connection.on('error', function(err) {
		dsApp.socketModule.userDrop('Client', connection)
		var server
		if ((server = dsApp.servers[0])) {
			connection = clientModule.connectToServer(server.ip, server.port)
			console.log('Connected in a New Server')
		} else {
			var attempts = 0
			var interval = setInterval(function() {
				attempts += 1
				console.log('Trying to reconnect to '+ip+':'+port)
				if (attempts >= maxAttempts) {
					clearInterval(interval)
					console.error('Maximum attempts were reached')
				} else {
					connection = clientModule.connectToServer(ip, port)
					if (connection.server)
						clearInterval(interval)
				}
			}, timeout)
		}
	})
})



