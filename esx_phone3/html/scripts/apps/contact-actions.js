(function(){

	Phone.apps['contact-actions'] = {};
	const app                     = Phone.apps['contact-actions'];

	let currentCol = 0;
	let currentAction;
	let currentContact;

	app.open = function(contact) {


		/* DEBUG */
			// //('OPENING CONTACT: ' + JSON.stringify(contact));
			// Phone.settings.background = { url: 'https://i.imgur.com/jbcbcML.png'};
			// Phone.settings.background = { url: 'https://i.imgur.com/4VenmnF.png', textColor: 'dark'};
			// contact = { 
			// 	name: 'Johan Stjernquist',
			// 	number: 12136
			// }
			// Phone.contacts.push(contact);
		/* --------- */

		currentContact = contact;
		currentCol     = 0;
		const elems    = $('#app-contact-actions .contact-action:visible');

		$('#app-contact-actions .contact-name')  .text(contact.name);
		$('#app-contact-actions .contact-image') .text(contact.name.charAt(0));
		$('#app-contact-actions .contact-number').text(contact.number);

		let found = Phone.favoritelist.find(x => (x.number - 0) === (contact.number - 0));
		$('#app-contact-actions .contact-is-favorite').text( found ? 'Ja' : 'Nej');

		let blockedindex = Phone.blockedlist.indexOf(contact.number - 0);
		$('#app-contact-actions .block-this-number').text(blockedindex > -1 ? 'Avblockera den här uppringaren' : 'Blockera den här uppringaren');

		let newContactFound = Phone.contacts.find(x => x.number == contact.number );
		if(newContactFound){
			//('Contact found.');
			$('#app-contact-actions .contact-action.new-contact').hide();
		} else {
			//('Contact not found.');
			$('#app-contact-actions .contact-action.new-contact').show();
		}


		if(elems.length > 0)
			app.selectElem(elems[0]);

	}

	app.move = function(direction) {

		const elems = $('#app-contact-actions .contact-action:visible');

		switch(direction) {

			case 'LEFT': {

				if(currentCol > 0)
					currentCol--;

				break;
			}

			case 'RIGHT': {

				if(currentCol + 1 < elems.length)
					currentCol++;

				break;
			}

			default: break;

		}

		app.selectElem(elems[currentCol]);

	}

	app.enter = function() {

		switch(currentAction) {

			case 'call' : {
				if (currentContact.number === 160000) {
					$.post('http://esx_phone3/call_stockholm', JSON.stringify(true))
				} else {
					Phone.open('contact-action-call', currentContact)
				}
				break;
			}

			case 'message' : {
				Phone.open('contact-action-message', currentContact)
				break;
			}

			case 'share-location' : {
				Phone.notification('Du delade din position med ' + currentContact.name);
				break;
			}

			case 'new-contact' : {
				Phone.open('contact-add', currentContact);
				break;
			}

			case 'block-number' : {

				let index = Phone.blockedlist.indexOf(currentContact.number - 0);

				if(index > -1){
					Phone.removeBlock(currentContact.number);
					Phone.notification('Du avblockerade nummer ' + currentContact.number);
					$('#app-contact-actions .block-this-number').text('Blockera den här uppringaren');
					$.post('http://esx_phone3/unblock_number', JSON.stringify(currentContact.number));
				} else {
					Phone.addBlock(currentContact.number);
					Phone.notification('Du blockerade nummer ' + currentContact.number);
					$('#app-contact-actions .block-this-number').text('Avblockera den här uppringaren');
					$.post('http://esx_phone3/block_number', JSON.stringify(currentContact.number));
				}

				break;
			}

			case 'remove' : {
				Phone.notification(currentContact.name + ' togs bort som kontakt');
				Phone.removeContact(currentContact.name, currentContact.number);
				Phone.close();
				break;
			}

			case 'favorite' : {
				let found = Phone.favoritelist.find(x => (x.number - 0) === (currentContact.number - 0));

				if(found){
					Phone.notification(currentContact.name + ' togs bort som favorit');
					Phone.removeFavorite(currentContact.name, currentContact.number);
					$('#app-contact-actions .contact-is-favorite').text('Nej');
				} else {
					if(Phone.contacts.find(x => x.number == currentContact.number)){
						Phone.addFavorite(currentContact.name, currentContact.number);
						$('#app-contact-actions .contact-is-favorite').text('Ja');
					} else {
						Phone.notification('Detta nummer finns inte i din kontaktlista')
					}
				}

				break;
			}

			default: break;

		}

	}

	app.selectElem = function(elem) {

		const elems = $('#app-contact-actions .contact-action');

		currentAction = $(elem).data('action');

		elems.removeClass('selected animated pulse infinite');

		$(elem).addClass('selected');
	}

})();
