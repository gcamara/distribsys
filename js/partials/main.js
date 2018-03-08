;(function() {
	var server = dsApp.socketModule.getServer()
	dsApp.showInfo('System running on '+server.address().address+':'+server.address().port)

	$(document).ready(function() {
		$('#server-ip').text(server.address().address)
		$('#server-port').text(server.address().port)

		$('#connectInstance').on('click', function() {
			var self = $(this)
			var port = $('#external-port').val()

			dsApp.client.connectToServer('localhost', port)
		})
	})
})()