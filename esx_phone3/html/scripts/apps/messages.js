(function () {

	Phone.apps['messages'] = {};
	const app = Phone.apps['messages'];
	const MAX_CONTACTS_ON_SCREEN = 6;
	let currentRow = 0;
	let currentContact = {};


	const messageListTpl = `
	{{#list}}
		<div class="contact" data-	name="{{name}}" data-number="{{number}}">
			<div class="{{#unread}}unread-dot{{/unread}}"></div>
			<div class="contact-image">{{image}}</div>
			<div class="contact-name">
				<span class="message-name">{{name}}</span>
				<span class="message-latest">{{latest}}</span>
			</div>
			<span class="contact-timestamp-span">{{timestamp}}</span>
		</div>
		{{/list}}`;


	app.open = function (data) {

		currentRow = 0;
		app.updateMessages();
		const elems = $('#app-messages .contact');

		if (elems.length > 0)
			app.selectElem(elems[0]);

	}

	app.update = function () {
		//('I AM A FUNCTION!!');
	}

	app.close = function () {
		$('.status-bar ul.signal li').css('background', '');
		$('.status-bar').css('background', '').css('color', '');
		$('#screen').css('border', '');
		return true;
	}

	app.move = function (direction) {

		const elems = $('#app-messages .contact');

		switch (direction) {

			case 'TOP': {

				if (currentRow > 0)
					currentRow--;

				break;
			}

			case 'DOWN': {

				if (currentRow + 1 < elems.length)
					currentRow++;

				break;
			}

			default: break;

		}

		elems.show();

		let diff = currentRow - MAX_CONTACTS_ON_SCREEN;

		if (diff > 0) {

			for (let i = 0; i < diff; i++)
				$(elems[i]).hide();

		}

		app.selectElem(elems[currentRow]);

	}

	app.enter = function () {
		if (currentContact.number) {
			Phone.open('contact-action-message', currentContact);
		}
	}

	app.selectElem = function (elem) {

		const elems = $('#app-messages .contact');
		currentContact.name = $(elem).data('name');
		currentContact.number = $(elem).data('number');

		elems.removeClass('selected');

		$(elem).addClass('selected');
	}

	app.updateMessages = function () {

		// console.log("updating messages")

		const contacts = {};
		let list = [];

		for (let i = 0; i < Phone.messages.length; i++) {

			const number = Phone.messages[i].number;

			if (typeof contacts[number] == 'undefined')
				contacts[number] = { unread: 0, timestamp: 0 };

			if (!Phone.messages[i].read)
				contacts[number].unread++;

			if (Phone.messages[i].timestamp > contacts[number].timestamp) {
				contacts[number].timestamp = Phone.messages[i].timestamp;
				contacts[number].latest = Phone.messages[i].body ? Phone.messages[i].body : 'idk wtf';
			}

		}

		for (let k in contacts) {
			if (contacts.hasOwnProperty(k)) {

				list.push({
					name: app.getContactName(k),
					image: app.getContactName(k).charAt(0),
					number: k,
					unread: contacts[k].unread,
					latest: contacts[k].latest,
					timestamp: getCallTime(contacts[k].timestamp),
					time: contacts[k].timestamp
				});

			}
		}

		/* DEBUG */
		// list = [{name: 'Zlay', number: 12136, unread: 0, timestamp: getCallTime(Date.now() - 90000000), image: 'Z', latest: 'Har du lust att'}, {name: 'qalle', image: 'Q', number: 12136, latest: 'Skulle du köpa', unread: false, timestamp: getCallTime(Date.now() - 900000)}, {name: 'Berra', image: 'B', number: 13371, latest: 'Bror du luktar fett kiss tack så mycket din jävel detta är ett långt sms som inte kommer få plats what so ever.', unread: 14, timestamp: getCallTime(Date.now() - 14 * 24 * 1000 * 3600 )}];
		/* ------ */
		list.sort((a, b) => {
			if (a.time > b.time) {
				return -1
			}
			return 1
		});

		const html = Mustache.render(messageListTpl, { list });

		$('#app-messages .contact-list').html(html);

	}

	app.getContactName = function (number) {

		if (number == '-1')
			return 'Okänd Avsändare';

		for (let i = 0; i < Phone.contacts.length; i++)
			if (Phone.contacts[i].number == number)
				return Phone.contacts[i].name;

		const elems = $('#app-home .menu-icon[data-app="contact-action-message"]');

		for (let i = 0; i < elems.length; i++)
			if ($(elems[i]).data('args').number == number)
				return $(elems[i]).data('args').name;

		return number;

	}

})();
