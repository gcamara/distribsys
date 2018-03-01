;(() => {
	window.log = new Log()
	var webSocket
	var nickname = 'FreeakN'
	var defaultMsgs = []
	defaultMsgs['join'] = 'entered the chat'
	defaultMsgs['leave'] = 'left the chat'

	$(document).ready(()=> {
		configureFieldsEvents()
		log.info('New instance loaded... ')
		log.warn('Please, go to ', { style: 'float: left; margin-right: 5px;'})
		log.addLink('<i class="fa fa-cogs"></i> Setup')

		$('.content-body').load('content/dashboard.html')
	})

	function configureFieldsEvents() {
		// Botão de conectar
		$('#connect').click((event) => connect())

		// Botão Send e Enter no input de texto
		$('#send').click((event) => sendMessage())
		$('#command').on('keypress', (event) => { if (event.keyCode == 13) sendMessage() })
	}

	function Log(text, event) {
		var self = this;
		self.text = (text, event, opts) => {
			text = formatDate() + " - " + text
			var element = $('<div class="'+event+'">'+text+'</div>')
			if (opts) {
				if (opts.style) {
					if (opts.style.lastIndexOf(';') == opts.style.length-1)
						opts.style = opts.style.substring(0, opts.style.length-1)
					var split = opts.style.split(';')
					for (var style in split) {
						var splitStyle = split[style].split(':')
						var key = splitStyle[0].trim()
						var value = splitStyle[1].trim()
						element.css(key, value)
					}
				}
			}
			
			$('.log .log-content').append(element)
			$('.log .log-content').scrollTop($('.log .log-content').prop('scrollHeight'))
		}
		self.info = (text, opts) => { self.text(text, 'info', opts) }
		self.warn = (text, opts) => { self.text(text, 'warn', opts) }
		self.error = (text, opts) => { self.text(text, 'error', opts) }
		self.message = (text, opts) => { self.text(text, 'message', opts) }
		self.addLink = (link, opts) => { $('.log .log-content').append('<a href="#" style="text-decoration: none">'+link+'</a></br>') }

		return self
	}

	function connect() {
		//var address = $('#ipServer').val()
		var address = '127.0.0.1:8000'
		webSocket = new WebSocket("ws://"+address)
		webSocket.onopen = function(event) {
			joinServer()
			log.info('Connected to server ' + address)
		}
		webSocket.onerror = function(error) {
			
		}
		webSocket.onmessage = function(event) {
			var data = JSON.parse(event.data)
			console.log(data)
			var name = data.name
			var event = data.event
			var message = data.message

			if (!message) {
				message = name + ' ' + defaultMsgs[event]
				if (event === 'leave')
					log.warn(message)
				else
					log.info(message)
			} else {
				log.message(name+": "+message)
			}		
		}
		webSocket.onclose = function(event) {
			if (event.code == 3001) {

			} else {
				log.error('Could not connect to the specified address...')
				log.error('Check whether the server is up or not.')
			}
		}
	}

	function joinServer() {
		webSocket.send(JSON.stringify({event: 'join', name: nickname}))
	}

	function sendMessage() {
		var text = $('#command').val()
		if (text) {
			if (webSocket) {
				webSocket.send(JSON.stringify({event: 'message', data: text}))
				log.message("You: "+text)
				$('#command').val('')
			} else {
				log.error('Not connected to any server... go to', { style: 'float: left; margin-right: 5px'})
				log.addLink('<i class="fa fa-cogs"></i> Setup')
			}
		}
	}

	function formatDate() {
		Number.prototype.padLeft = function(base,chr) {
		    var  len = (String(base || 10).length - String(this).length)+1;
		    return len > 0? new Array(len).join(chr || '0')+this : this;
		}

		var d = new Date
    	var dformat = [d.getDate().padLeft(),
    		   (d.getMonth()+1).padLeft(),
               d.getFullYear()].join('/') +' ' +
              [d.getHours().padLeft(),
               d.getMinutes().padLeft(),
               d.getSeconds().padLeft()].join(':')

       return "["+dformat+"]"
	}

})()