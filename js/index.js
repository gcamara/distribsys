var dsApp = {
	http: require('http'),
	stringify: require('./node/node_modules/json-stringify'),
	socketModule: require('./node/socket-config')(),
	clModule: require('./node/client'),
	wsModule: require('./node/webserver'),
	servers: [],
	users: [],
	scanner: require('evilscan')
}
;(function() {

	//App Global Variables
	dsApp.showError = showError
	dsApp.showInfo = showInfo
	dsApp.showWarn = showWarn
	dsApp.addInstance = _addInstance
	dsApp.log = new Log()
	dsApp.network = require('./node/network')()

	btn = $('#teste')
	port = $('#port')
	instanceAlias = $('#alias')

	btn.on('click', function() {
	    dsApp.myPort = port.val()
	    dsApp.instanceAlias = instanceAlias.val()
	    if (!dsApp.myPort || (dsApp.myPort && (dsApp.myPort < 9000 || dsApp.myPort > 9005))) {
	    	showError('Port number can\'t be empty and must be a number between 3000 and 3005.')
	    	return
	    }

	    if (!dsApp.instanceAlias) { 
	    	showError('You must inform an alias for this instance')
	    	return
	    }
	    try {
	    	dsApp.myPort = parseInt(dsApp.myPort)
		    dsApp.client = dsApp.clModule(dsApp.myPort)
		    dsApp.socketModule.getServer().listen(dsApp.myPort, dsApp.network.getIp())
		    $('body').fadeOut('slow', function() { 
		    	$('body').load('partials/dashboard.html', function() {
		    		$('body').fadeIn(800)
		    	})
		    })
	    } catch (e) {
	    	showError('Port number can\'t be empty and must be a number.')
	    }
	})

	port.on('keypress', (event) => { if (event.keyCode === 13) btn.click() })

	$(document).ready(() => {
		instanceAlias.focus()
	})

	function _addInstance(alias, ip, port) {
		if (alias) {
			console.log('Adding instance '+alias)
			var el = $('<li id="ip_'+alias+'_'+port+'"><i class="material-icons">computer</i> '+alias+' ('+ ip + ':' + port +')</li>')
			$('ul.sub-menus.instances').append(el)
		}
	}

	function addNotification(msg, type) {
		var ic = type === 'error' ? 'report' : type;
	  	var notification = $('<div class="notification-container"><div class="notification '+type+' show"><i class="small material-icons">'+ic+'</i> <span> '+msg+'</span></div></div>')
	  	$('body').append(notification)
	  	setTimeout(() => notification.fadeOut(600, function() { $(this).remove() }), 1600)
	}

	function showError(msg) {
	  	addNotification(msg, 'error')
	}

	function showInfo(msg) {
	  	addNotification(msg, 'info')
	}

	function showWarn(msg) {
		addNotification(msg, 'warn')
	}

	function Log(text, event) {
		var self = this;
		self.text = (text, event, opts) => {
			text = formatDate() + ' - ' + event.toUpperCase() + ' - ' + text
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
			
			$('.content').append(element)
			$('.content').scrollTop($('.content').prop('scrollHeight'))
		}
		self.info = (text, opts) => { self.text(text, 'info', opts) }
		self.warn = (text, opts) => { self.text(text, 'warn', opts) }
		self.error = (text, opts) => { self.text(text, 'error', opts) }
		self.message = (text, opts) => { self.text(text, 'message', opts) }
		self.addLink = (link, opts) => { $('.content').append('<a href="#" style="text-decoration: none">'+link+'</a></br>') }

		return self
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
