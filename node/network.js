var address
module.exports = () => {
	_getIp()
	return {
		scanNetwork: _scanNetwork,
		getSubnetMask: calculateSubnet,
		getIp: () => { return address }
	}
}

function _scanNetwork() {
	console.log('Scanning')
	var ip
	_getIp(function (err, add, fam) {
			dsApp.log.info('Local IP Address: '+add)
			var subnet = calculateSubnet()
			ip = add
			var target = ip.substring(0, ip.lastIndexOf('.'))+'.0'
			console.log(target+'/'+subnet)
			var opts = {
			target: target+'/'+subnet,
			port: '9000-9005',
			status: 'TROU',
			banner: true,
			concurrency: 1000
		}

		var scanner = new dsApp.scanner(opts)
		scanner.on('result', data => {
			if (data.status == 'open') {
				if (data.port != dsApp.myPort) {
					dsApp.log.info('Found connection at '+data.ip+':'+data.port)
					dsApp.client.connectToServer(data.ip, data.port)
				}
			}
		})
		scanner.on('error', err => {
			dsApp.log.error('Error '+err)
		})
		scanner.on('done', () => {
			dsApp.log.info('Network scan done')
		})

		scanner.run()
	})
}

function _getIp(callback) {
	console.log('getIp')
	var dns = require('dns')
	var hostname = require('os').hostname()
	if (callback)
		dns.lookup(hostname, callback)
	else
		dns.lookup(hostname, (err, add) => { address = add })
}

function calculateSubnet() {
	var os = require('os')
	var interface = os.networkInterfaces().Ethernet.filter((interface => interface.family == 'IPv4'))
	var netmask = interface[0].netmask

	var split = netmask.split('.')
	var subnetCidr = 0
	//Convert number to binary and counts number 1 occurrences
	split.forEach(number => subnetCidr += (parseInt(number).toString(2).match(/1/g) || []).length)

	return subnetCidr
}