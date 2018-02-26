var net = require('net')
var client = net.Socket()
var me = 'FreeakN'

client.connect(8000, function() {
	console.log('Connected')
	var data = { event: 'join', name: me, time: new Date()}
	client.write(JSON.stringify(data))
})

client.on('data', function(data) {
	console.log('Received: '+data+' \n')
})

client.on('close', () => console.log('Connection ended'))