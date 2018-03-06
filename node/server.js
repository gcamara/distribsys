var http = require('http')
var webSocketServer = require('websocket').server
var stringify = require('json-stringify')
var readline = require('readline')
var users = []
var servers = []
var serverNumber
var net = require('net')
var client = net.Socket()
var me = 'FreeakN'

if (process.argv.indexOf('-port') == -1) {
	console.error('Parameter -port is mandatory.')
	process.exit(1)
}
var myPort = process.argv[process.argv.indexOf('-port') + 1]
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

/*var server = http.createServer(function(){})
server.listen(port, function() {
	console.log('Server listening on port ' + port)
	rl.question("Connect to port?", function(answer) { 
		connectToServer('localhost', parseInt(port))
		console.log('Trying to connect to '+port)
	})
})

var wsServer = new webSocketServer({ httpServer: server })
wsServer.on('request', function(request) {
	var socket =  request.accept(null, request.origin)
	configureSocket(socket)
})*/

var server = net.createServer(function(socket) {
	configureSocket(socket)
	//socket.pipe(socket)
})

server.listen(myPort, 'localhost', function(socket) {
	rl.question("Connect to port?", function(answer) { 
		connectToServer('localhost', parseInt(answer))
		console.log('Trying to connect to '+answer)
	})
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
	console.log('Configuring connection')
	socket.on('close', function() { userDrop(socket) })
	socket.on('data', function(data) {
		var content = JSON.parse(data)
		//console.log(data)
		var event = 'message'
		if (content.name) {
			socket.name = content.name
			event = 'join'
			users.push(socket)
			sendConnections(socket)
		}
		if (content.ip) {}
		//broadcastEvent(socket, content.event, content.data)
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

/* Client Side */
function connectToServer(ip, port) {
	var ports = servers.map(m => m.remotePort)

	if (ports.indexOf(port) === -1) {
		client.connect(port, ip, function() {
			console.log('Connected ')
			var data = { event: 'join', ip: 'localhost', port: myPort, time: new Date()}
			client.setKeepAlive(true)
			client.write(JSON.stringify(data))
			servers.push(client)	
		})

		client.on('data', function(data) {
			console.log('Received: '+data+' \n')
		})

		client.on('close', (err) => { console.log('Connection ended'); console.log(err) })
	}
}