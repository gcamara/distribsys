;(function() {
	var server = dsApp.socketModule.getServer()
	dsApp.log.info('System running on '+server.address().address+':'+server.address().port+' ('+dsApp.instanceAlias+')')
	dsApp.removeInstance = _removeInstance

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
	})
})()