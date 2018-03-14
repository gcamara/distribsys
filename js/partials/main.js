;(function() {
	var server = dsApp.socketModule.getServer()
	console.log(server.address())
	dsApp.log.info('System running on '+server.address().address+':'+server.address().port+' ('+dsApp.instanceAlias+')')
	dsApp.removeInstance = _removeInstance

	var commandCache = []
	var commandIndex = 0
	var tabIndex = 0
	var commands = {
		connect: {
			description: 'Connect to a given address',
			params: {
				'a': {
					required: true,
					alias: 'ip_address'
				},
				'p': {
					required: true,
					alias: 'port'
				}
			}
		},
		send: {
			description: 'Send message a given address or specify ALL in &lt;-a&gt; param. It has autocomplete by pressing TAB Key or Shift+Tab Key',
			params: {
				'a': {
					required: true,
					alias: 'ip_address'
				},
				'p': {
					required: true,
					alias: 'port'
				},
				'message': {
					required: false
				}
			}
		},
		disconnect: {
			description: 'Disconnect all connections (Servers and Users)',
		},
		clear: {
			description: 'Clear the log'
		},
		help: {
			description: 'Display help content',
			params: {
				'command': {
					required: false
				}
			}
		},
	}

	function _removeInstance(alias, ip, port) {
		console.log('remove ')
		$('ul.sub-menus.instances').find('#ip_'+alias+'_'+port).remove()
	}

	$(document).ready(function() {
		$('#server-ip').text(dsApp.network.getIp())
		$('#server-port').text(server.address().port)
		$('#server-alias').text(dsApp.instanceAlias)

		dsApp.network.scanNetwork()

		$('#command').on('keydown', function(event) {
			// Enter Key Event
			if (event.keyCode == 13) {
				processCommand($(this).val())
				$(this).val('/')
			}
			else {
				// Arrow Up and Down event
				if (event.keyCode == 38 || event.keyCode == 40) {
					event.preventDefault()
					var command;
					if (event.keyCode == 40) {
						if (commandIndex > 0) {
							command = commandCache[--commandIndex]
						}
					}

					else if (event.keyCode == 38)
						if (commandIndex < commandCache.length-1)
							command = commandCache[++commandIndex]

					if (command)
						$(this).val('/'+command)
				}

				// Tab Event
				if (event.keyCode == 9) {
					event.preventDefault()
					var cmd = $(this).val();
					var user
					if (cmd.startsWith('/send')) {
						if (event.shiftKey && tabIndex > 0)
							tabIndex -= 1
						else if (tabIndex < dsApp.servers.length - 1)
							tabIndex += 1
						if ((user = dsApp.servers[tabIndex]))
							$(this).val('/send -a '+user.ip+' -p '+user.port+' ')
					} else {

					}
				}
			}
		})
		$('#command').on('focus', function() {
			if (!$(this).val())
				$(this).val('/')
		})

		function processCommand(command) {
			if (command.startsWith('/')) {
				command = command.substring(1, command.length)
				var params = command.split(" ")
				commandCache.splice(0, 0, command)
				command = params[0]
				++commandIndex

				if (command === 'connect') {
					var address
					var port
					if ((address = findParameter(params, '-a')) && (port = findParameter(params, '-p'))) {
						dsApp.log.info('Trying to connect to '+address+':'+port)
						try { 
							dsApp.client.connectToServer(address, port)
						} catch (e) {
							dsApp.log.error('It was not possible to connect to the given address')
							dsApp.log.error('Check whether the remote address exists or not')
						}
					}
					else if (params.length < 4)
						dsApp.log.error('Missing parameters -a or -p')
				}

				else if (command === 'help') {
					if (params.length <= 1) {
						dsApp.log.warn('The following commands are allowed: ')
						showCommands()
					}
				}
				else if (command === 'clear') {
					$('.content').html('')
				}
				else if (command === 'send')
					sendMessage(params)
				else if (command === 'disconnect') {
					location.reload()
				}
				

				else {
					dsApp.log.error('Invalid command /'+command)
				}
			}
		}

		function findParameter(params, param) {
			var index = -1
			if ((index = params.indexOf(param)) > -1)
				return params[index + 1]
			return null
		}

		function sendMessage(params) {
			var address
			var port
			if ((address = findParameter(params, '-a')) && (port = findParameter(params, '-p'))) {
				var server = dsApp.servers.filter(server => { return server.ip == address && server.port == port })
				if (server) {
					var msg = Array.from(params, (v, k) => { if (k > 4) return v }).filter(n => { return n != undefined }).join(' ')
					server[0].socket.write(msg)
					dsApp.log.info('[Local]: '+msg)
				} else {
					dsApp.log.error('No connection found with given parameters')
				}
			} else {
				if (address.toLowerCase() == 'all') {
					var msg = Array.from(params, (v, k) => { if (k > 2) return v }).filter(n => { return n != undefined }).join(' ')
					dsApp.socketModule.broadcastMessage(dsApp.socketModule.getServer(), 'message', msg)
				}
				else
					dsApp.log.warn('Missing parameters -a or -p')
			}
		}

		function showCommands() {
			Object.keys(commands).forEach(command => {
				var cmdObj = commands[command]
				var cmdStr = "/"+command
				if (cmdObj.params) {
					Object.keys(cmdObj.params).forEach(param => {
						paramObj = cmdObj.params[param]
						if (paramObj.alias) {
							cmdStr += ' -'+param
							if (paramObj.required)
								cmdStr += ' &lt;'+paramObj.alias+'&gt;'
						} else if (!paramObj.required)
								cmdStr += ' ['+param+']'

						})
				}
				cmdStr += ' --- '+cmdObj.description
				dsApp.log.warn(cmdStr)
			})
		}
	})
})()