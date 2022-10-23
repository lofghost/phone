(function(){

	Phone.apps['contacts']       = {};
	Phone.blockedlist 			 		 = [];
	const app                    = Phone.apps['contacts'];
	let currentRow               = 1;
	let currentAction            = null;
	let currentCategory			 		 = 'contacts';
	const currentContact         = {};

	const contactTpl             = '{{#contacts}}<div class="contact" data-name="{{name}}" data-number="{{number}}"><div class="contact-name">{{name}}</div><div class="contact-number">{{number}}</div></div>{{/contacts}}';

	app.open = function(data) {

		$('.selected').removeClass('selected');

		currentRow = Phone.rememberRow ? Phone.rememberRow : 0;
		Phone.rememberRow = 0;
		const html = Mustache.render(contactTpl, {contacts: Phone.contacts});

		$('#app-contacts .contact-list').html(html);

		app.openCategory('contacts', true);
		app.updateCategoryColor();

	}

	app.move = function(direction) {
		const elems = $('#app-contacts .contact-actions div:visible, #app-contacts .contact-list .contact:visible, .contact-bottom-actions > div:visible, .contacts-latest-list > ul > li:visible, .rowSelectable:visible, .contact-favorite:visible');
		// console.log('CURRENT ROW: ', currentRow);

		switch(direction) {

			case 'TOP': {
				if($('#keypad').is(':visible')){
					if(currentRow > 2 && currentRow < 12) {
						currentRow -= 3;
						break;
					} else if(currentRow == 0) {
						currentRow = elems.length - 1;
					} else if(currentRow < 3){
						currentRow += 11;
					} else if(currentRow == 12 || currentRow == 13){
						currentRow -= 2;
					} else if(currentRow > elems.length - 4){
						currentRow = 13;
					} else {
						currentRow--;
					}

					break;
				}

				if(currentRow > 0)
					currentRow--;
				else
					currentRow = elems.length - 1;
				break;
			}

			case 'DOWN': {

				if($('#keypad').is(':visible')){
					if(currentRow == 10)
						currentRow += 2;
					else if (currentRow == 11)
						currentRow += 2;
					else if (currentRow + 4 < elems.length)
						currentRow += 3;
					else if(currentRow + 1 < elems.length)
						currentRow++;
					else
						currentRow = 0;
					break;
				}

				if(currentRow + 1 < elems.length)
					currentRow++;
				else
					currentRow = 0;
				break;
			}

			case 'RIGHT': {
				if(currentRow + 1 < elems.length)
					currentRow++;
				else
					currentRow = 0;

				break;
			}

			case 'LEFT': {
				if(currentRow > 0)
					currentRow--;
				else
					currentRow = elems.length - 1;
				break;
			}

			default: break;

		}

		app.selectElem(elems[currentRow]);

	}

	app.enter = function() {

		if (Phone.nextAction) {
			currentAction = Phone.nextAction;
			Phone.nextAction = null;
		}

		switch(currentAction) {

			case 'add-contact' : {
				Phone.open('contact-add');
				break;
			}

			case 'contact' : {
				Phone.open('contact-actions', currentContact);
				break;
			}

			/* From image-app */
			case 'send_image' : {

				const index = Phone.apps['images-app'].activeIndex;
				const image = Phone.photos[index];
				
				if (currentContact.number && currentContact.name) {
					Phone.opened = ['home'];
					Phone.open('images-app');
					Phone.emitClientEvent(currentAction, { ...currentContact,  ...image });
				} else {
					Phone.notification('Fotot skickades inte, du valde inte en kontakt');
					Phone.opened = ['home'];
					Phone.open('images-app');
				}
				currentAction = null;
				break;
			}

			case 'category':
				app.openCategory(currentCategory);
				app.updateCategoryColor();
			break;

			case 'call-latest':
				Phone.open('contact-actions', currentContact);
				Phone.rememberRow = currentRow;
			break;

			case 'open-favorite':
				Phone.open('contact-actions', currentContact);
			break;

			case 'press-key':
				let nr = $('#keypadNumber');
				let key = $('button.selected, i.selected').data('key');
				if(key === 'backspace'){
					nr.text(nr.text().slice(0, -1));
				} else {
					nr.text(nr.text() + key);
				}
			break;

			case 'call-number':
				if($('#keypadNumber').text() === "160000") {
					$.post('http://esx_phone3/call_stockholm', JSON.stringify(true))
				} else {
					Phone.open('contact-actions', {number: $('#keypadNumber').text(), name: 'Okänt'})
				}
			default : break;

		}

	}

	app.close = function(){
		$('.status-bar ul.signal li').css('background', '');
		$('.status-bar').css('background', '').css('color', '');
		$('#screen').css('border', '');
		return true;
	}

	app.selectElem = function(elem) {

		const elems = $('#app-contacts .contact-actions div:visible, #app-contacts .contact-list .contact:visible, .contact-bottom-actions > div:visible, .contacts-latest-list > ul > li:visible, .rowSelectable:visible, .contact-favorite:visible');

		if($(elem).hasClass('contact')) {

			currentAction         = 'contact';
			currentContact.name   = $(elem).data('name');
			currentContact.number = $(elem).data('number');

		}

		if($(elem).hasClass('add-contact')) {
			currentAction = 'add-contact'
		}

		if($(elem).hasClass('category')) {
			currentAction 	= 'category';
			currentCategory = $(elem).attr('data');
		}

		if($(elem).hasClass('latest-caller')) {
			currentAction 	= 'call-latest';
			currentContact.name   = $(elem).data('name');
			currentContact.number = $(elem).data('number');
		}

		if($(elem).hasClass('contact-favorite')) {
			currentAction 		  = 'open-favorite';
			currentContact.name   = $(elem).data('name');
			currentContact.number = $(elem).data('number');
		}

		if($(elem).hasClass('keypadKey')) {
			currentAction 	= currentAction = 'press-key';
		}

		if($(elem).hasClass('callkey')) {
			currentAction 	= currentAction = 'call-number';
		}

		elems.removeClass('selected');

		$(elem).addClass('selected');

		app.scroll();
	}


	app.openCategory = function(category, firstOpen) {
		switch (category) {

			case 'favorites':
				app.hideCategories('favorites');
				app.loadCategory('favorites');
				currentRow = Phone.favoritelist.length;
			break;

			case 'latest':
				app.hideCategories('latest');
				app.loadCategory('latest');
				currentRow = Phone.latestCalls.length + 1;
			break;

			case 'contacts':
				app.hideCategories('contacts');
				if (firstOpen) {
					const elems = $('#app-contacts .contact-list .contact');
					// console.log('Elems: ', elems);
					if(elems.length > 0) {
						app.selectElem(elems[0]);
					}
					currentRow = 1;
				} else {
					currentRow = Phone.latestCalls.length + 4;
				}
			break;

			case 'keypad':
				app.hideCategories('keypad');
				app.loadCategory('keypad');
				currentRow = 17;
			break;

			default: break;

		}

	}

	app.updateCategoryColor = function(){
		$('#app-contacts .contact-bottom-actions > div').removeClass('selectedCategory');
		$('div[data="'+currentCategory+'"]').addClass('selectedCategory');
	}


	app.hideCategories = function(category){

		/* Hide contacts */
		$('.contact-actions').hide();
		$('.contact-me').hide();
		$('.contact-list').hide();

		/* Hide favorites */
		$('.contacts-favorites').hide();

		/* Hide latest */
		$('.contacts-latest').hide();

		/* Hide keypad */
		$('.contacts-keypad').hide();

		switch (category) {
			case 'favorites':
				$('.contacts-favorites').show();
			break;

			case 'latest':
				$('.contacts-latest').show();
			break;

			case 'contacts':
				$('.contact-actions').show();
				$('.contact-me').show();
				$('.contact-list').show();
			break;

			case 'keypad':
				$('.contacts-keypad').show();
			break;

			default: break;
		}
	}

	app.loadCategory = function(category){
		let ul;

		switch (category) {
			case 'favorites':
				ul = $('.contacts-favorites-list > ul');
				ul.empty();
				let favoritelist = Phone.favoritelist;
				//console.log('Favoritelist: ' + JSON.stringify(favoritelist));
				$.each(favoritelist, (index, contact) => {

					let li = $('<li />').appendTo(ul).addClass('contact-favorite').data({name: contact.name, number: contact.number});

					$(`<span>${contact.name}</span> <span>${contact.number}</span>`).appendTo(li)

				});
			break;

			case 'latest':
				ul = $('.contacts-latest-list > ul');
				ul.empty();
				let latestList = Phone.latestCalls.sort((x, y) => {
					if(x.time > y.time){
						return -1;
					} else {
						return 1;
					}
				});

				$.each(latestList, (index, contact) => {

					let li = $('<li />').appendTo(ul).addClass(contact.missed ? 'missed' : '').addClass('latest-caller').data({name: contact.name, number: contact.number});

					$('<div />').appendTo(li).append(`<span>${contact.name}</span> <span>${contact.number}</span>`);
					$('<span />').text(getCallTime(contact.time)).appendTo(li);

				});
			break;

			case 'contacts':

			break;

			case 'keypad':
				let keypadButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'];
				let keypad = $('#keypad');
				keypad.empty();
				$.each(keypadButtons, (index, key) => {

					$('<button />').text(key).data({key}).appendTo(keypad).addClass('keypadKey rowSelectable');

				});


			break;

			default: break;
		}
	}

	app.toggleKeypadBackspace = function(){

	}


	app.scroll = function(){
		let doc = document.getElementsByClassName('selected');
		if(doc.length){
			doc[0].scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: 'start'
			});
		}
	}

})();

function getCallTime(time){
	let old = new Date(time), curr = new Date();
	let days = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag'];

	let hours = old.getHours() < 10 ? '0' + old.getHours() : old.getHours();
	let minutes = old.getMinutes() < 10 ? '0' + old.getMinutes() : old.getMinutes();

	let date = old.getDate() < 10 ? '0' + old.getDate() : old.getDate();
	let month = old.getMonth() < 10 ? '0' + (old.getMonth() + 1) : (old.getMonth() + 1);

	if((old.getTime() + 48 * 1000 * 3600) > curr.getTime()){
		if(curr.getDate() === old.getDate()){
			return hours + ':' + minutes;
		} else if(curr.getDate() - 1  === old.getDate()){
			return 'igår';
		}
	} else if((old.getTime() + 7 * 24 * 1000 * 3600) > curr.getTime()){
		if(old.getDay()){
			return days[old.getDay() - 1];
		} else {
			return 'söndag';
		}
	} else {
		return old.getFullYear() + '-' + month + '-' + date;
	}

}
