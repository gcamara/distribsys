;(() => {
	var log = new Log()
	function connect(address) {
		var socket = new WebSocket("ws://"+address)
		socket.onopen = function(event) {
			socket.send('FreeakN connected')
			log.info('Connected to server ' + address)
		}
	}	

	$(document).ready(()=> {
		$('#connect').click((event) => {
			var ip = $('#ipServer').val()
			connect(ip)
		})
	})

	function Log(text, event) {
		var self = this;

		self.text = (text, event) => {
			var element = $('<div class="'+event+'">'+text+'</div>')
			$('.log').append(element)
		}
		self.info = (text) => { self.text(text, 'info') }
		self.warn = (text) => { self.text(text, 'warn') }
		self.error = (text) => { self.text(text, 'error') }

		return self
	}


})()