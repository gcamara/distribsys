var dsApp = {
	http: require('http'),
	stringify: require('./node/node_modules/json-stringify'),
	socketModule: require('./node/socket-config')(),
	clModule: require('./node/client'),
	wsModule: require('./node/webserver'),
	servers: [],
	users: []
}
;(function() {

	//App Global Variables
	dsApp.showError = showError
	dsApp.showInfo = showInfo
	dsApp.showWarn = showWarn
	dsApp.addInstance = _addInstance

	btn = $('#teste')
	port = $('#port')
	instanceAlias = $('#alias')

	btn.on('click', function() {
	    dsApp.myPort = port.val()
	    dsApp.instanceAlias = instanceAlias.val()
	    if (!dsApp.myPort) {
	    	showError('Port number can\'t be empty and must be a number.')
	    	return
	    }

	    if (!dsApp.instanceAlias) { 
	    	showError('You must inform an alias for this instance')
	    	return
	    }
	    try {
	    	dsApp.myPort = parseInt(dsApp.myPort)
		    dsApp.client = dsApp.clModule(dsApp.myPort)
		    dsApp.socketModule.getServer().listen(dsApp.myPort, 'localhost')
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
		var el = $('<div> ALIAS '+alias+' / IP '+ip+' / PORT: '+port+'</div>')
		$('.content').append(el)
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
})()
