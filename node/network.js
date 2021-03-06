var address
var portRange = {
	from: 9000,
	to: 9005
}
var totalIpTested = 0
module.exports = (ports) => {
	if (ports)
		portRange = ports

	_getIp()
	return {
		scanNetwork: _scanNetwork,
		getSubnetMask: calculateSubnet,
		getIp: () => { return address }
	}
}

function _scanNetwork() {
	dsApp.log.warn('Scanning over network '+module.exports().getIp()+'/'+calculateSubnet())
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
			totalIpTested += 1
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
			dsApp.log.warn('Total of '+totalIpTested+' tests over network')
			totalIpTested = 0
		})

		scanner.run()
	})
}

function _getIp(callback) {
	var dns = require('dns')
	var hostname = require('os').hostname()
	if (callback)
		dns.lookup(hostname, callback)
	else
		dns.lookup(hostname, (err, add) => { address = add })
}

function calculateSubnet() {
	var os = require('os')
	var interfaces = os.networkInterfaces();
	var keys = Object.keys(interfaces)
	var ethernet
	var interface

	for (var i = 0; i < keys.length; i++) {
		var int = interfaces[keys[i]]
		if (int) {
			Object.values(int).filter(inter => {
				if (inter.address != "127.0.0.1" && inter.family == "IPv4") {
					interface = inter
				}
			})
			if (interface) break;
		}
	}
	
	//var interface = ethernet.filter((interface => interface.family == 'IPv4'))
	var netmask = interface.netmask

	var split = netmask.split('.')
	var subnetCidr = 0
	//Convert number to binary and counts number 1 occurrences
	split.forEach(number => subnetCidr += (parseInt(number).toString(2).match(/1/g) || []).length)

	return subnetCidr
}