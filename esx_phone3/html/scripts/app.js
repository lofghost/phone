(function () {
	window.Phone = {};
	Phone.rtc = {}
	Phone.apps = {};
	Phone.opened = [];
	Phone.contacts = [];
	Phone.favoritelist = [];
	Phone.latestCalls = [];
	Phone.messages = [];
	Phone.appData = {};
	Phone.hiddenIcons = {};
	Phone.settings = { openedApps: [] };
	Phone.currentVersion = '12.2'
	Phone.photos = [];
	Phone.nextAction = null;
	Phone.twitter = { tweets: [] }
	Phone.contacts.sort((a, b) => a.name.localeCompare(b.name));

	/* DEBUG */
	// Phone.photos = JSON.parse('[{"time":1553310015,"link":"https://i.imgur.com/mvTYUjG.jpg"},{"time":1551320058,"link":"https://i.imgur.com/V4Okipx.jpg"},{"time":1553310067,"link":"https://i.imgur.com/qy5yu8U.jpg"},{"time":1553310072,"link":"https://i.imgur.com/tuQck8w.jpg"},{"time":1553310078,"link":"https://i.imgur.com/C0CzrUd.jpg"},{"time":1553310083,"link":"https://i.imgur.com/F82MKGk.jpg"},{"time":1553310088,"link":"https://i.imgur.com/sGNd3oO.jpg"},{"time":1553310015,"link":"https://i.imgur.com/INDN0c3.jpg"},{"time":1553310058,"link":"https://i.imgur.com/V4Okipx.jpg"},{"time":1553310067,"link":"https://i.imgur.com/qy5yu8U.jpg"},{"time":1553310072,"link":"https://i.imgur.com/tuQck8w.jpg"},{"time":1553310078,"link":"https://i.imgur.com/C0CzrUd.jpg"},{"time":1553310083,"link":"https://i.imgur.com/F82MKGk.jpg"},{"time":1553310072,"link":"https://i.imgur.com/tuQck8w.jpg"},{"time":1553310078,"link":"https://i.imgur.com/C0CzrUd.jpg"},{"time":1553310083,"link":"https://i.imgur.com/F82MKGk.jpg"},{"time":1553310088,"link":"https://i.imgur.com/sGNd3oO.jpg"},{"time":1553310015,"link":"https://i.imgur.com/INDN0c3.jpg"},{"time":1553310058,"link":"https://i.imgur.com/V4Okipx.jpg"},{"time":1553310067,"link":"https://i.imgur.com/qy5yu8U.jpg"},{"time":1553310072,"link":"https://i.imgur.com/tuQck8w.jpg"},{"time":1553310078,"link":"https://i.imgur.com/C0CzrUd.jpg"},{"time":1553310083,"link":"https://i.imgur.com/F82MKGk.jpg"},{"time":1553310072,"link":"https://i.imgur.com/tuQck8w.jpg"},{"time":1553310078,"link":"https://i.imgur.com/C0CzrUd.jpg"},{"time":1553310083,"link":"https://i.imgur.com/F82MKGk.jpg"},{"time":1553310088,"link":"https://i.imgur.com/sGNd3oO.jpg"},{"time":1553310015,"link":"https://i.imgur.com/INDN0c3.jpg"},{"time":1553310058,"link":"https://i.imgur.com/V4Okipx.jpg"},{"time":1553310067,"link":"https://i.imgur.com/qy5yu8U.jpg"},{"time":1553310072,"link":"https://i.imgur.com/tuQck8w.jpg"},{"time":1553310078,"link":"https://i.imgur.com/C0CzrUd.jpg"},{"time":1553310083,"link":"https://i.imgur.com/F82MKGk.jpg"}]');
	// Phone.contacts = [
	// 	{
	// 		name: 'berra',
	// 		number: '112'
	// 	}
	// ]
	/* DEBUG */

	Phone.move = function (direction) {

		const currrent = this.current();

		if (currrent != null)
			this.apps[currrent].move(direction);

	}

	Phone.enter = function (direction) {

		const currrent = this.current();

		if (currrent != null)
			this.apps[currrent].enter();
	}

	Phone.open = function (appName, data = {}) {
		// Phone.rtcSwitch("CONNECT", { ["rtcId"]: Phone.rtcId })

		// setTimeout(() => {
		// 	Phone.disconnect();

		// 	console.log("disconnecting shitty ocice")
		// }, 5000);

		Phone.appData[appName] = data;
		Phone.opened.push(appName);

		/* Count open apps */
		if (!Phone.settings.openedApps.includes(appName) && appName !== 'home') {
			Phone.settings.openedApps.push(appName);
		}

		Phone.apps[appName].open(data);

		$('.app').hide();
		$('#app-' + appName).show();

		if (appName === 'settings' || appName === 'your-car' || appName === 'twitter' || appName === 'contacts' || appName === 'contact-add' || appName === 'contact-actions' || appName === 'bank' || appName === 'messages' || appName === 'contact-action-message' || appName === 'companies') {
			/* Set color of status bar */
			$('.status-bar').css('background', '#fefefe').css('color', '#232323');
			$('.status-bar ul.signal li').css('background', '#333');
			$('.status-bar ul.signal li:nth-child(4)').css('background', '#999');
			$('.status-bar ul.signal li:nth-child(5)').css('background', '#999');
		} else if (appName === 'contact-action-call' || appName === 'incoming-call') {
			$('.status-bar').css({
				background: 'none',
				color: 'rgb(254, 254, 254)',
				paddingTop: '5px',
				boxSizing: 'border-box'
			});

			$('#app-contact-action-call').css({
				height: '100%',
				marginTop: '-16px'
			});

			$('.status-bar .battery').css('top', '7.5px')
			$('.battery b').css('margin-top', '-2px')

			$('.status-bar ul.signal li').css('background', '#fefefe');
		} else if (appName === 'camera-app') {
			$('#phone').addClass('camera-app-position');
			$('#phone').removeClass('slideInUp');

			setTimeout(() => {
				$('#screen').css({
					backgroundImage: 'none'
				});

				$('#phone').addClass('camera-app-portrait');
			}, 400);

		} else {
			$('#phone').removeClass('camera-app-portrait');
			$('#phone').removeClass('camera-app-landscape');
			$('#phone').removeClass('camera-app-position');
			$('#phone').addClass('slideInUp');

			/* Default */
			$('.status-bar ul.signal li').css('background', '');
			$('.status-bar').css('background', '').css('color', '');
		}

	}

	Phone.addContact = function (name, number) {
		this.contacts.push({ name, number });
		this.contacts.sort((a, b) => a.name.localeCompare(b.name));
	}

	Phone.removeContact = function (name, number) {
		let found = this.contacts.find(x => x.number === number && x.name === name);

		if (found) {
			let index = this.contacts.indexOf(found);
			this.contacts.splice(index, 1);

			this.removeFavorite(name, number, true);

			$.post('http://esx_phone3/remove_contact', JSON.stringify(number));
		}
	}

	Phone.addBlock = function (number) {
		this.blockedlist.push(number);
	}

	Phone.removeBlock = function (number) {
		let index = this.blockedlist.indexOf(number);
		if (index > -1)
			this.blockedlist.splice(index, 1);
	}

	Phone.addFavorite = function (name, number) {
		this.favoritelist.push({ name, number });
		this.favoritelist.sort((a, b) => a.name.localeCompare(b.name));
		this.notification(name + ' är nu en favorit!');
		$.post('http://esx_phone3/add_favorite', JSON.stringify({ name, number }));
	}

	Phone.removeFavorite = function (name, number) {
		let found = this.favoritelist.find(x => x.number == number);

		if (found) {
			let index = this.favoritelist.indexOf(found);
			this.favoritelist.splice(index, 1);
			$.post('http://esx_phone3/remove_favorite', JSON.stringify(number));
		}
	}

	Phone.openPrompt = function (available, number) {
		const _current = this.current();

		if (_current != null)
			this.apps[_current].openPrompt(available, number);
	}

	Phone.update = function (data) {
		const _current = this.current();

		if (_current != null)
			this.apps[_current].update(data);
	}

	Phone.notification = function (message) {
		$('#notification-div').show();
		$('#notification-div > span').text(message);

		setTimeout(function () {
			if ($('#notification-div > span').text() == message)
				$('#notification-div').hide();
		}, 3500);
	}

	Phone.close = function () {

		const currrent = this.current();

		if (currrent != null) {

			if (typeof this.apps[this.current()].close != 'undefined') {

				const canClose = this.apps[this.current()].close();

				if (canClose) {

					this.opened.pop();

					if (this.opened.length > 0) {

						Phone.apps[this.current()].open(this.appData[this.current()]);

						$('.app').hide();
						$('#app-' + this.current()).show();
					}

				}
			} else {

				this.opened.pop();

				if (this.opened.length > 0) {

					Phone.apps[this.current()].open(this.appData[this.current()]);

					$('.app').hide();
					$('#app-' + this.current()).show();
				} else {
					$.post('http://esx_phone3/escape');
					$('#phone').hide();
				}

			}

		}

	}

	Phone.disconnect = function () {
		return console.log("Default disconnect.")
	}

	Phone.current = function () {
		return this.opened[this.opened.length - 1] || null;
	}

	Phone.emitClientEvent = function (event, data) {
		const options = {
			method: 'POST',
			body: JSON.stringify({ event, data })
		};
		console.log('Sending event to client: ' + event);
		fetch('http://nuipipe/nui_client_response', options);
	}

	document.onkeydown = function (e) {

		if (Phone.current() == 'settings' && Phone.settings.inputIsActive && (e.which === 38 || e.which === 40)) {
			//console.log('Prevented falsly movement with arrows.');
			return;
		}

		switch (e.which) {

			// FLECHE HAUT
			case 38: {
				Phone.move('TOP');
				break;
			}

			// FLECHE BAS
			case 40: {
				Phone.move('DOWN');
				break;
			}


			// FLECHE GAUCHE
			case 37: {
				Phone.move('LEFT');
				break;
			}

			// FLECHE DROITE
			case 39: {
				Phone.move('RIGHT');
				break;
			}

			case 113: {
				// Phone.twitterName 		= 'Berra';
				// Phone.twitterImg 		= 'Rl7lsJ9.jpg';
				// Phone.twitterVerified 	= 1;
				onData({ showPhone: true, openApp: 'images-app' });
				break;
			}

			case 13: {
				Phone.enter();
				break;
			}

			case 27: {
				Phone.close();
				break;
			}

			// FLECHE DROITE
			case 8: {
				if (Phone.current() == 'settings') {
					Phone.close();
				} else if (Phone.current() == 'bank') {
					if (!Phone.settings.inputIsActive) {
						Phone.close();
					} else {
						Phone.move('BACKSPACE');
					}
				}
				break;
			}

			case 9: {
				e.preventDefault();
				break;
			}

			default: break;

		}

	};


	window.onData = function (data) {
		if (data.controlPressed === true) {
			if (Phone.settings.inputIsActive && (data.control === 'BACKSPACE' || data.control === 'TOP' || data.control === 'DOWN')) {
				return;
			}
			switch (data.control) {

				case 'TOP': Phone.move('TOP'); break;
				case 'DOWN': Phone.move('DOWN'); break;
				case 'LEFT': Phone.move('LEFT'); break;
				case 'RIGHT': Phone.move('RIGHT'); break;
				case 'ENTER': Phone.enter(); break;
				case 'BACKSPACE': Phone.close(); break;
				// case 'SPEAKING': Phone.rtcSwitch("TOGGLE_MICROPHONE", {
				// 	["holding"]: data["isHolding"]
				// }); break;

				default: break;

			}

		}

		if (data.updateBattery === true) {
			var batteryValue = document.getElementById("phoneBattery")
			var batteryIcon = document.getElementById("batteryIcon")
			var currentIcon = batteryIcon.className

			var newBattery = data.battery

			Phone.settings.battery = newBattery

			if (newBattery <= 80 && newBattery > 50) {
				currentIcon = "fa fa-battery-three-quarters fa-fw"
			} else if (newBattery <= 50 && newBattery > 20) {
				currentIcon = "fa fa-battery-half fa-fw"
			} else if (newBattery <= 20 && newBattery > 10) {
				currentIcon = "fa fa-battery-quarter fa-fw"

				Phone.notification("20% Batterinivå återstår.")
			} else if (newBattery <= 10) {
				currentIcon = "fa fa-battery-empty fa-fw"

				Phone.notification("10% Batterinivå återstår.")
			} else {
				currentIcon = "fa fa-battery-full fa-fw"
			}

			batteryIcon.className = currentIcon
			batteryValue.innerHTML = data.battery + "%"

			$.post('http://esx_phone3/save_settings', JSON.stringify({
				identifier: Phone.identifier,
				settings: {
					flightmode: Phone.settings.flightmode,
					sleepmode: Phone.settings.sleepmode,
					callSound: Phone.settings.callSound,
					background: Phone.settings.background,
					themeID: Phone.settings.themeID,
					battery: Phone.settings.battery,
					version: Phone.settings.version,
					messages: Phone.messages
				}
			})
			);
		}

		if (data.showDeadPhone === true) {
			$('.app').hide();
			$('#app-dead').show();

			$('#phone').show();
		}

		if (data.darkweb === true) {
			Phone.update(data.messages)
		}

		/* Contacts */
		if (data.updateLatestCalls === true) {
			if (!Phone.settings.flightmode) {
				Phone.latestCalls = data.data;
			}
		}

		/* Blocked */
		if (data.updateBlockedList === true) {
			Phone.blockedlist = data.data;
		}

		/* Favorites */
		if (data.updateFavorites === true) {
			Phone.favoritelist = data.data;
		}

		/* Twitter */
		if (data.updateTwitter === true) {
			if (!Phone.settings.flightmode) {
				Phone.apps["twitter"].update(data.tweets);
				Phone.apps["home"].updateCounters()
			}
		}

		if (data.updateTwitterName === true) {
			Phone.twitterName = data.twitterName;
			Phone.twitterImg = data.twitterImg;
			if (data.twitterVerified) {
				Phone.twitterVerified = 1;
			}
		}

		if (data.twitterCheck === true) {
			Phone.update({ twitterCheck: true, passed: data.passed });
		}

		/* Din bil */
		if (data.updateVehicles === true) {
			if (!data.vehicles.length) {
			} else {
				data.type = 'ALL';
				Phone.update(data);
			}
		} else if (data.updateCurrentVehicle === true) {
			data.type = 'CURRENT';
			Phone.update(data);
		}

		/* Företag*/
		if (data.updateCompanies === true) {
			if (Phone.current() == 'companies') {
				if (data.companies) {
					Phone.update(data.companies);
				} else {
					//console.log('No data.');
				}
			}
		}

		if (data.numberCheck === true) {
			if (data.numberData.available === true) {
				Phone.openPrompt(true, data.numberData.number);
			} else if (data.numberData.available === false) {
				Phone.openPrompt(false, data.numberData.number);
			}
		}

		if (data.showPhone === true) {
			if (!Phone.phoneNumber) {
				Phone.phoneNumber = 'Hämtar..';
			}

			if (data.openApp) {
				Phone.open(data.openApp);
			} else {
				Phone.opened.length = 0;
				Phone.open('home');
			}

			$('#phone').show();

		}

		if (data.showPhone === false) {
			$('#phone').hide();
		}

		if (data.reloadPhone == true) {
			Phone.identifier = data.phoneData.identifier;
			Phone.contacts.length = 0;

			var Number = formatPhoneNumber(data.phoneData.phoneNumber)

			$('#app-contacts .contact-me .contact-number').text(Number);
			Phone.phoneNumber = + data.phoneData.phoneNumber;

			for (let i = 0; i < data.phoneData.contacts.length; i++)
				Phone.addContact(data.phoneData.contacts[i].name, data.phoneData.contacts[i].number);

			for (let k in Phone.hiddenIcons)
				if (Phone.hiddenIcons.hasOwnProperty(k))
					$('#app-home .menu-icon-' + k).hide();
		}

		if (data.reloadSettings === true) {
			loadSettings(data.settings);
		}

		/* Load photos */
		if (data.updatePhotos === true) {
			if (data.photos.length) {
				const sortedPhotos = data.photos.sort((x, y) => {
					if (x.time < y.time) {
						return -1;
					}
					return 1;
				});
				Phone.photos = sortedPhotos;
				Phone.update();
			}
		}

		if (data.incomingCall === true) {

			let name = '';

			for (let i = 0; i < Phone.contacts.length; i++)
				if (Phone.contacts[i].number == data.number)
					name = Phone.contacts[i].name;

			if (data.isJob) {
				name = 'Växel'
			}

			if (name === '') {
				name = 'Okänt';
			}

			if (Phone.settings.flightmode) {
				$.post('http://esx_phone3/add_latest', JSON.stringify({ name, number: data.number, missed: true, incoming: true, time: Date.now() }));
				return true;
			} else {
				Phone.open('incoming-call', {
					name: name,
					target: data.target,
					channel: data.channel,
					number: data.number,
					rtcId: data.rtcId
				});
			}

		}

		if (data.acceptedCall === true) {
			Phone.apps['contact-action-call'].startCall(data.channel, data.target, data.rtcId);
		}

		if (data.fakeCall === true) {
			Phone.open('contact-action-call', { number: "Taxi", name: "Taxi" })
		}

		if (data.endCall === true) {
			Phone.disconnect();

			Phone.close();
		}

		if (data.showIcon === true) {
			delete Phone.hiddenIcons[data.icon];
			$('#app-home .menu-icon-' + data.icon).show();
		}

		if (data.showIcon === false) {
			Phone.hiddenIcons[data.icon] = true;
			$('#app-home .menu-icon-' + data.icon).hide();
		}

		if (data.loadMessages === true) {
			Phone.messages = data.messagesSent

			// this.console.log(`messages recieved ${JSON.stringify(Phone.messages)}`)
		}

		if (data.newMessage === true) {
			const date = new Date();

			Phone.messages.push({
				number: data.phoneNumber,
				body: data.message,
				image: data.image,
				position: data.position,
				anon: data.anon,
				job: data.job,
				self: false,
				time: date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0'),
				timestamp: +date,
				read: false,
			})

			Phone.apps['contact-action-message'].updateMessages();
		}

		if (data.contactAdded === true) {
			Phone.addContact(data.name, data.number);
		}

		if (data.activateGPS === true && Phone.current() === 'contact-action-message') {
			Phone.apps['contact-action-message'].activateGPS()
		}

		if (data.onPlayers === true) {
			switch (data.reason) {

				case 'bank_transfer': {

					Phone.open('bank-transfer', data.players)

					break;
				}

				default: break;

			}
		}

	}

	/* Functions */
	function loadSettings(settings) {
		//console.log('Loading settings.');
		Phone.settings = {
			...Phone.settings,
			...settings
		}

		if (settings.flightmode) {
			$('.status-bar ul.signal').hide();
			$('.status-bar .plane').show()
			$.post('http://esx_phone3/set_flightmode', JSON.stringify(true))
		} else {
			$('.status-bar ul.signal').show();
			$('.status-bar .plane').hide();
			$.post('http://esx_phone3/set_flightmode', JSON.stringify(false))
		}

		/* Theme */
		if (settings.themeID) {
			$('#app-home .menu-icon-inner').addClass('theme' + settings.themeID);
		}

		/* Background */
		let background = settings.background;

		if (background) {
			if (background.url.includes('http')) {
				$('#screen').css('background-image', 'url("' + background.url + '")');
			} else {
				$('#screen').css('background-image', 'url(' + background.url + ')');
			}
			$('#app-home .menu-icon-label').css('color', background.textColor === 'dark' ? '#000' : '#fefefe');
			$('#app-home .menu-icon-label').css('text-shadow', background.textColor === 'dark' ? '1px 1px 2px #fff' : '1px 2px #444');
		}
	}

	function formatPhoneNumber(phoneNumber) {
		return phoneNumber.substr(0, 3) + '-' + phoneNumber.substr(3, 3) + ' ' + phoneNumber.substr(6, 2) + ' ' + phoneNumber.substr(8, 2);
	}

	window.onload = function (e) {
		window.addEventListener('message', function (event) {
			onData(event.data);
		});

		/* Adding browswer open phone key, cba to look for the other one support for  development of apps */


		/* 				case 'TOP'       : Phone.move('TOP');   break;
						case 'DOWN'      : Phone.move('DOWN');  break;
						case 'LEFT'      : Phone.move('LEFT');  break;
						case 'RIGHT'     : Phone.move('RIGHT'); break;
						case 'ENTER'     : Phone.enter();       break;
						case 'BACKSPACE' : Phone.close();       break; */

	}

	$('.app').addClass('animated zoomIn');

	setInterval(() => {

		const date = new Date;

		$('.status-bar .time .hour').text(date.getHours().toString().padStart(2, '0'));
		$('.status-bar .time .minute').text(date.getMinutes().toString().padStart(2, '0'));

	}, 1000);

})();