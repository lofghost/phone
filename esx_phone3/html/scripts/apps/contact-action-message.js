(function () {

	Phone.apps['contact-action-message'] = {};
	const app = Phone.apps['contact-action-message'];

	const messagesTpl = `
	{{#messages}}
		<div class="time">{{time}}</div>
		<div class="message{{#self}} self{{/self}}{{#image}} image{{/image}}">

		{{#image}}
			<img src="{{image}}" /></img>
		{{/image}}
		{{^image}}
				{{body}}
		
				{{#position}}&nbsp;<i class="fa fa-map-marker" />
				{{/position}}
		{{/image}}

			
		</div>
	{{/messages}}`;

	let isTyping = false;
	let currentCol = 0;
	let currentContact;
	let gps_active = false;

	app.open = function (contact) {
		isTyping = false;
		currentContact = contact;

		app.updateMessages();

		$('#app-contact-action-message .message-input textarea[name="message"]').removeClass('typing');

		setTimeout(() => {
			$('#app-contact-action-message .message-input textarea[name="message"]').focus();
		}, 50);

	}

	app.update = function () {
		//('I AM A FUNCTION!!');
	}

	app.close = function () {

		if (isTyping) {

			isTyping = false;
			$('#app-contact-action-message .message-input textarea[name="message"]').removeClass('typing');
			$.post('http://esx_phone3/release_focus');
			currentContact = {};
			return false;

		} else {
			currentContact = {};
			$('.status-bar ul.signal li').css('background', '');
			$('.status-bar').css('background', '').css('color', '');
			$('#screen').css('border', '');
			return true;
		}
	}

	app.move = function (direction) {
		let scrollable = $('#app-contact-action-message .message-container')[0];

		switch (direction) {
			case 'TOP': {
				scrollable.scrollTop -= 20;
				break;
			}

			case 'DOWN': {
				scrollable.scrollTop += 20;
				break;
			}

			case 'LEFT': {
				break;
			}

			case 'RIGHT': {
				break;
			}
			default:
				break;
		}

	}

	app.enter = function () {
		if (isTyping) {

			const msg = $('#app-contact-action-message .message-input textarea[name="message"]').val();
			const date = new Date()

			Phone.messages.push({
				name: currentContact.name,
				number: currentContact.number,
				position: false,
				anon: false,
				job: false,
				self: true,
				time: date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0'),
				timestamp: +date,
				body: msg,
				read: true,
			});

			$.post('http://esx_phone3/send', JSON.stringify({
				messageData: {
					name: currentContact.name,
					number: currentContact.number,
					position: false,
					anon: false,
					job: false,
					self: true,
					time: date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0'),
					timestamp: +date,
					body: msg,
					read: true,
				}
			}));

			app.updateMessages();

			$('#app-contact-action-message .message-dialog').hide();
			$('#app-contact-action-message .message-input textarea[name="message"]').val('');
			$('#app-contact-action-message .message-input textarea[name="message"]').focus();
			$('#app-contact-action-message .message-input textarea[name="message"]').removeClass('typing');
			// $('#app-contact-action-message .message-actions')[0].scrollIntoView();

			isTyping = false;
			$.post('http://esx_phone3/release_focus');

		} else {

			isTyping = true;
			$('#app-contact-action-message .message-input textarea[name="message"]').addClass('typing');
			$.post('http://esx_phone3/request_focus');
		}
	}

	app.updateMessages = function () {
		//const messages = [{time: '18:30', body: 'aaaaaaaaaaaaa', self: false, image: 'https://i.imgur.com/tuQck8w.jpg' }, {time: '18:30', body: 'This is a message', self: false}, {time: '18:30', image: 'https://i.imgur.com/tuQck8w.jpg', self: true}, {time: '18:30', body: 'This is a message', self: true}];

		const messages = Phone.messages.filter((e) => e.number == currentContact.number);
		// console.log('Messages:', messages);
		for (let i = 0; i < messages.length; i++) {
			if (messages[i - 1]) {
				messages[i].time = messages[i].timestamp < messages[i - 1].timestamp + 5 * 60 * 1000 ? '' : messages[i].time;
			}

			messages[i].read = true;
		}

		Phone.apps['messages'].updateMessages();

		const html = Mustache.render(messagesTpl, { messages });
		// console.log('Messages are: ', messages);

		// console.log('html is: ', html);
		$('#app-contact-action-message .message-container').html(html);

		let messageBox = $('#app-contact-action-message .message-container')

		let boxHeight = messageBox.height()

		messageBox.animate({
			scrollTop: boxHeight * messages.length
		}, 500)
	}

	app.toggleIcon = function (val) {
		let icon = $('#app-contact-action-message .message-input > i');
		if (val) {
			icon.removeClass('fa-square-o');
			icon.addClass('fa-check-square-o');
		} else {
			icon.removeClass('fa-check-square-o');
			icon.addClass('fa-square-o');
		}
	}

	app.activateGPS = function () {

		if (gps_active) {
			gps_active = false;
			this.toggleIcon(false);
		} else {
			gps_active = true;
			this.toggleIcon(true);
		}

		const filtered = Phone.messages.filter((e) => !e.self && e.number == currentContact.number && e.position != false);

		if (filtered.length > 0) {
			filtered.reverse();
			$.post('http://esx_phone3/activate_gps', JSON.stringify(filtered[0].position));
		}
	}

	/* Text area rezise height */


})();
