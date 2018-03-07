;(function() {
	var http = require('http')
	var stringify = require('./node/node_modules/json-stringify')
	var socketModule = require('./node/socket-config')()
	var clModule = require('./node/client')
	var wsModule = require('./node/webserver')
	var serverNumber

	var client
	var server = socketModule.getServer()

  var btn = document.getElementById('teste')
  var port = document.getElementById('port')

  btn.addEventListener('click', function() {
    myPort = port.value
    client = clModule(myPort)
    server.listen(myPort, 'localhost')
    console.log('Listening on '+myPort)
  })
})()
