(function(){

	Phone.apps['bank'] = {};
	const app          = Phone.apps['bank'];
	let currentRow     = -1;
	let currentAction;

	app.open = function(data) {
		//'Opened swosh.');
		$.post('http://esx_phone3/request_input_focus');
	}

	app.move = function(direction) {
		const elems = $('#app-bank .button:visible, #app-bank input:visible');
		switch(direction) {

			case 'TOP': {

				if(currentRow > 0)
					currentRow--;

				break;
			}

			case 'DOWN': {

				if(currentRow + 1 < elems.length)
					currentRow++;

				break;
			}

			case 'BACKSPACE': {
				//'Backspacing.');
				if($('#app-bank input.selected').val().length === 0){
					Phone.close();
				}

				break;
			}

			default: break;

		}

		app.selectElem(elems[currentRow]);

	}

	app.close = function(){
		$('.status-bar ul.signal li').css('background', '');
		$('.status-bar').css('background', '').css('color', '');
		$('#screen').css('border', '');
		Phone.settings.inputIsActive = false;
		$.post('http://esx_phone3/release_focus');
		return true;
	}

	app.enter = function() {

		switch(currentAction) {

			case 'transfer' : {
				let number = $('#app-bank input').first().val();
				let amount = $('#app-bank input').last().val() - 0;
				if(number.length > 4 && amount > 0){
					Phone.notification('Du skickade ' + amount + 'kr till nummer ' + number);
					$.post('http://esx_phone3/send_swish', JSON.stringify({number: number - 0, amount}));
					Phone.close();
				} else {
					//'error');
					Phone.notification('Du kan inte swisha 0 kronor')
				}

				break;
			}

			case 'move' : {
				this.move('DOWN');
			}

			default: break;

		}

	}

	app.selectElem = function(elem) {
		const elems = $('#app-bank .button:visible, #app-bank input:visible');

		currentAction = $(elem).data('action');

		for(let i=0; i<elems.length; i++)
			$(elems[i]).removeClass('selected');


		$(elem).addClass('selected');

		if($(elem).is(':visible') && $(elem).hasClass('selected') && $(elem)[0].nodeName === 'INPUT'){
			//'Setting true');
			Phone.settings.inputIsActive = true;
			elem.focus();
		} else {
			Phone.settings.inputIsActive = false;
			$('input:visible').blur();
		}
		
	}

})();
