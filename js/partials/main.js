;(function() {
	var server = dsApp.socketModule.getServer()
	dsApp.log.info('System running on '+server.address().address+':'+server.address().port+' ('+dsApp.instanceAlias+')')
	dsApp.removeInstance = _removeInstance
	var commandCache = []
	var commandIndex = 0

	function _removeInstance(alias, ip, port) {
		console.log('remove ')
		$('ul.sub-menus.instances').find('#ip_'+alias+'_'+port).remove()
	}

	$(document).ready(function() {
		$('#server-ip').text(server.address().address)
		$('#server-port').text(server.address().port)
		$('#server-alias').text(dsApp.instanceAlias)

		$('#connectInstance').on('click', function() {
			var self = $(this)
			var port = $('#external-port').val()

			dsApp.client.connectToServer('localhost', port)
		})

		$('#showServers').on('click', function() {
			dsApp.socketModule.showServers()
		})

		$('#command').on('keydown', function(event) {
			console.log(event.keyCode)
			if (event.keyCode == 13) {
				processCommand($(this).val())
				$(this).val('/')
			}
			else {
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
			}
		})
		$('#command').on('focus', function() {
			if (!$(this).val())
				$(this).val('/')
		})

		function processCommand(command) {
			console.log('called')
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
						dsApp.log.warn('/connect -a &lt;ip&gt; -p &lt;port&gt;  --- To connect to a given address')
						dsApp.log.warn('/kick -a &lt;ip&gt; -p &lt;port&gt; --- To kick some server instance')
						dsApp.log.warn('/clear --- To clear the log')
						dsApp.log.warn('/nmap --- To map network')
						dsApp.log.warn('/help [command]')
					}
				}
				else if (command === 'clear') {
					$('.content').html('')
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
	})
})()