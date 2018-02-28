;(() => {
	$(document).ready(() => {
		var menuItem = $('.menu ul li')
		var submenu = $('.sub-menu')

		menuItem.click(function(event) {
			var self = $(this)
			var myIndex = menuItem.index(this)

			if (!self.hasClass('selected'))
				self.addClass('selected')
			menuItem.each((index) => { 
				var menu = $(menuItem.get(index))
				if (index != myIndex)
					menu.removeClass('selected') 
			})

			var subs = self.find('ul')
			setTimeout(() => { 
				submenu.empty()
				submenu.removeClass('display') 
				if (subs.get(0)) 
					setTimeout(() => {
						submenu.addClass('display')

						//Adiciona os Menus
						setTimeout(() => {
							submenu.append(subs.clone())
						})
					}, 400)
			}, 100)
		});

		$('ul li').click(function(event) {
			var self = $(this)
			var link
			if ((link = self.attr('src')) != undefined)
				$('.content .content-body').load('content/'+link)
		})

		$(window).click(event => {
			var target = $(event.target)
			if (target[0] !== submenu[0]) {
				submenu.empty()
				submenu.removeClass('display')
			}
		})
	})
})()