
(function () {

	Phone.apps['contact-action-call'] = {};
	const app = Phone.apps['contact-action-call'];

	let currentCol = 0;
	let intervals = [];
	let currentContact = {}
	let callSound = null;
	let incomingCall = false;
	let currentChannel;

	app.open = function (contact) {
		if (contact.incoming) {
			incomingCall = true;
		}

		//('OPENING CONTACT: ' + JSON.stringify(contact));
		//Phone.settings.background = { url: 'https://i.imgur.com/jbcbcML.png'}; /* Debug */
		// Phone.settings.background = { url: 'https://i.imgur.com/4VenmnF.png', textColor: 'dark'}; /* Debug */
		// contact = { /* Debug  */
		// 	name: 'Johan Stjernquist Gustavsson den tredje',
		// 	number: 12136
		// }

		currentCol = 0;
		currentContact = contact;

		const elems = $('#app-contact-action-call .call-action:visible');

		if (elems.length > 0)
			app.selectElem(elems[0]);

		if (Phone.settings != null && Phone.settings.background != null && Phone.settings.background.textColor != null) {
			$('#app-contact-action-call .contact-infos > div:first-child').attr('class', Phone.settings.background.textColor);
		} else {
			$('#app-contact-action-call .contact-infos > div:first-child').attr('class', 'dark');
		}

		if (Phone.settings != null && Phone.settings.background != null) {
			$('.action-call-background').css('background-image', `url('${Phone.settings.background.url}')`);
		}

		let arr = contact.name.split(' ');
		$('#app-contact-action-call .contact-image').text(arr.length == 1 ? contact.name.charAt(0).toUpperCase() : arr[0].charAt(0).toUpperCase() + arr[1].charAt(0).toUpperCase());

		$('#app-contact-action-call .loader .info').text('Ringer..');
		$('#app-contact-action-call').removeClass('online');
		$('#app-contact-action-call .contact-name').text(contact.name);
		$('#app-contact-action-call .contact-number').text(contact.number);


		if (!incomingCall) {
			callSound = new Audio('ogg/outgoing-call.ogg');
			callSound.loop = false;
			callSound.volume = 0.2


			callSound.play();

			$.post('http://esx_phone3/start_call', JSON.stringify({ number: currentContact.number, name: currentContact.name, rtcId: Phone.rtcId }))
		}

	}

	app.close = function () {
		if (callSound != null) {
			callSound.pause();
			callSound = null;
		}

		intervals.map(e => clearInterval(e));

		intervals = [];

		if (typeof currentChannel != 'undefined') {
			//('Ending call for current player.');
			$.post('http://esx_phone3/end_call', JSON.stringify({
				target: currentTarget,
				channel: currentChannel
			}));

			// Phone.disconnect()

			currentTarget = undefined;
			currentChannel = undefined;
		} else if (!incomingCall) {
			/* If the currentChannel isn't defined and this is not a incoming call, then we close the phone for the other player. */
			$.post('http://esx_phone3/end_call_for_number', JSON.stringify({ number: currentContact.number, name: currentContact.name }));
		}

		$('.status-bar').css({
			background: '',
			color: '',
			paddingTop: '',
			boxSizing: ''
		});

		$('.status-bar .battery').css('top', '')
		$('.battery b').css('margin-top', '')

		$('.status-bar').css('background', '#fefefe').css('color', '#232323');
		$('.status-bar ul.signal li').css('background', '#333');
		$('.status-bar ul.signal li:nth-child(4)').css('background', '#999');
		$('.status-bar ul.signal li:nth-child(5)').css('background', '#999');


		if (incomingCall) {
			// //('This is the incoming call. ( I WAS CALLED )');
			/* Set the only app open to the HOME-app, then we close the phone.*/
			Phone.opened = ['home'];
			Phone.close();
		}
		incomingCall = false;
		app.toggle('default-state');
		return true;
	}

	app.move = function (direction) {
		const elems = $('#app-contact-action-call .call-action:visible');

		switch (direction) {

			case 'LEFT': {

				if (currentCol > 0)
					currentCol--;

				break;
			}

			case 'RIGHT': {

				if (currentCol + 1 < elems.length)
					currentCol++;

				break;
			}

			default: break;

		}

		app.selectElem(elems[currentCol]);

	}

	app.enter = function () {

		switch (currentAction) {
			case 'end-call':
				Phone.close();
				break;

			case 'mute':
				app.toggle('mute')
				break;

			case 'audio-off':
				app.toggle('audio');
				break;

			case 'add-call':
				//('Adding person to call');
				break;

		}

	}

	app.selectElem = function (elem) {

		currentAction = $(elem).data('action');

		const elems = $('#app-contact-action-call .call-action:visible');

		elems.removeClass('selected');

		$(elem).addClass('selected');
	}

	app.toggle = function (action) {

		let mute = $('#app-contact-action-call .call-action .mute-action');
		let audio = $('#app-contact-action-call .call-action .audio-off-action');

		switch (action) {

			case 'mute':
				if (!currentChannel) {
					Phone.notification('Inget aktivt samtal kunde hittas.');
					break;
				}
				if (mute.hasClass('fa-microphone')) {
					mute.removeClass('fa-microphone').addClass('fa-microphone-slash');
					$.post('http://esx_phone3/toggle_microphone', JSON.stringify({ bool: false, channel: currentChannel }));
				} else {
					mute.removeClass('fa-microphone-slash').addClass('fa-microphone');
					$.post('http://esx_phone3/toggle_microphone', JSON.stringify({ bool: true, channel: currentChannel }));
				}
				break;
			case 'audio':
				if (!currentChannel) {
					Phone.notification('Inget aktivt samtal kunde hittas.');
					break;
				}
				if (audio.hasClass('fa-volume-up')) {
					audio.removeClass('fa-volume-up').addClass('fa-volume-off');
					$.post('http://esx_phone3/toggle_phone_audio', JSON.stringify({ bool: false, channel: currentChannel }));
				} else {
					audio.removeClass('fa-volume-off').addClass('fa-volume-up');
					$.post('http://esx_phone3/toggle_phone_audio', JSON.stringify({ bool: true, channel: currentChannel }));
				}
				break;
			case 'default-state':
				audio.removeClass('fa-volume-off').addClass('fa-volume-up');
				mute.removeClass('fa-microphone-slash').addClass('fa-microphone');
				break;
			default:
				return;
		}

	}

	app.startCall = function (channel, target, rtcId) {

		const startDate = new Date;
		currentChannel = channel;
		currentTarget = target;

		// Phone.rtcSwitch("CONNECT", {
		// 	["rtcId"]: rtcId
		// })

		if (!incomingCall) {
			callSound.pause();
			callSound = null;
		}

		$('#app-contact-action-call').addClass('online');
		$('#app-contact-action-call .loader .info').text('00:00');

		intervals.push(setInterval(() => {

			const currentDate = new Date;
			const elapsed = new Date(currentDate - startDate);

			$('#app-contact-action-call .loader .info').text(elapsed.getMinutes().toString().padStart(2, '0') + ':' + elapsed.getSeconds().toString().padStart(2, '0'));

		}, 1000));

	}

})();
