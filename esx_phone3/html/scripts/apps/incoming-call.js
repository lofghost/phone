(function () {

	Phone.apps['incoming-call'] = {};
	const app = Phone.apps['incoming-call'];

	let currentCol = 0;
	let currentAction;
	let currentContact;
	let callSound;

	app.open = function (contact) {

		/* DEBUG */
		// Phone.settings.background = { url: 'https://i.imgur.com/jbcbcML.png'};
		// contact = {
		// 	name: 'Johan Stjernquist',
		// 	number: 12136
		// }
		/* ----------------- */

		Phone.settings.background = Phone.settings.background ? Phone.settings.background : { url: 'https://i.imgur.com/jbcbcML.png' };
		$('.action-call-background').css('background-image', `url('${Phone.settings.background.url}')`);


		currentContact = contact;
		currentCol = 0;
		const elems = $('#app-incoming-call .contact-action');

		$('#app-incoming-call .contact-action[data-action="accept"]').show();

		$('#app-incoming-call .contact-name').text(contact.name);
		$('#app-incoming-call .contact-number').text(contact.number);

		if (elems.length > 0)
			app.selectElem(elems[0]);

		if (Phone.settings.callSound) {
			callSound = new Audio(Phone.settings.callSound.fileurl);
		} else {
			callSound = new Audio('ogg/incoming-call.ogg');
		}

		callSound.loop = true;

		callSound.play();

	}

	app.close = function () {
		if (callSound) {
			callSound.pause();
			callSound = null;
		}

		return true;

	}

	app.move = function (direction) {

		const elems = $('#app-incoming-call .contact-action');

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

			case 'accept': {

				$.post('http://esx_phone3/add_latest', JSON.stringify({ name: currentContact.name, number: currentContact.number, missed: false, incoming: true, time: Date.now() }));

				const elems = $('#app-incoming-call .contact-action');

				callSound.pause();
				callSound = null;

				$('#app-incoming-call .contact-action[data-action="accept"]').hide();

				currentCol = 1;
				app.selectElem(elems[currentCol]);

				$.post('http://esx_phone3/accept_call', JSON.stringify({
					target: currentContact.target,
					channel: currentContact.channel,
				}));
				app.close();
				Phone.open('contact-action-call', { ...currentContact, incoming: true });
				let c = currentContact;
				Phone.apps['contact-action-call'].startCall(c.channel, c.target, c.rtcId); /* (channel, target, name, number)  */

				break;
			}

			case 'deny': {
				if (!callSound) {
					$.post('http://esx_phone3/add_latest', JSON.stringify({ name: currentContact.name, number: currentContact.number, missed: false, incoming: true, time: Date.now() }));
				} else {
					$.post('http://esx_phone3/add_latest', JSON.stringify({ name: currentContact.name, number: currentContact.number, missed: true, incoming: true, time: Date.now() }));
				}

				$.post('http://esx_phone3/end_call', JSON.stringify({
					target: currentContact.target,
					channel: currentContact.channel,
				}));

				Phone.close();
				break;
			}

			default: break;

		}

	}

	app.selectElem = function (elem) {

		const elems = $('#app-incoming-call .contact-action');

		currentAction = $(elem).data('action');

		elems.removeClass('selected');

		$(elem).addClass('selected');
	}

})();
