var http = require('http')
var webSocketServer = require('websocket').server
var users = []
var serverNumber

var server = http.createServer(()=>{})
server.listen(8000, () => {
	console.log('Server listening on port 8000')
})

var wsServer = new webSocketServer({ httpServer: server })
wsServer.on('request', (request) => {
	var socket =  request.accept(null, request.origin)

	configureSocket(socket)
})

function broadcastEvent(socket, event, msg) {
	var defaultMsgs = []
	defaultMsgs['join'] = ' entered the chat'
	defaultMsgs['leave'] = ' left the chat'

	users.forEach(user => {
		if (user === socket) return
		
		if (defaultMsgs.indexOf(event) === -1)
			user.write(socket.name+': '+ msg)
		else
			user.write(socket.name + defaultMsgs[event])
	})
}

function configureSocket(socket) {
	socket.on('close', () => userDrop(socket))
	socket.on('message', (data) => { 
		if (data.name !== undefined)
			socket.name = data.name
		broadcastEvent(socket, 'message', data.event)
	})
	socket.on('error', () => userDrop(socket))
}

function userDrop(socket) {
	users.splice(users.indexOf(socket), 1)
	broadcastEvent(socket, 'leave')
	console.log('User '+socket.name+' dropped')
}
