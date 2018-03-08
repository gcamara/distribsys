var dsApp = {}
;(function() {

	//App Global Variables
	dsApp.http = require('http')
	dsApp.stringify = require('./node/node_modules/json-stringify')
	dsApp.socketModule = require('./node/socket-config')()
	dsApp.clModule = require('./node/client')
	dsApp.wsModule = require('./node/webserver')
	dsApp.serverNumber
	dsApp.showError = showError
	dsApp.showInfo = showInfo
	dsApp.showWarn = showWarn
	dsApp.client

	btn = $('#teste')
	port = $('#port')

	btn.on('click', function() {
	    dsApp.myPort = port.val()
	    if (!dsApp.myPort) {
	    	showError('Port number can\'t be empty and must be a number.')
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
		port.focus()
	})

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
