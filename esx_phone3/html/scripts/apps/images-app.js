(function(){

	Phone.apps['images-app']       = {};
	const app                    = Phone.apps['images-app'];
	app.activeIndex = -1;
	let activeIndex = -1;
	let moveList = []
	let imageIsOpen = false;
	let imageOpenedIndex = null;
	let imageMenuIsOpen = false;

	app.open = function(data) {
		updateImages();
	}
	const scrollable = $('#app-images-app .main-list')[0];

	app.move = function(direction) {
		switch(direction) {
			case 'TOP':
				scrollable.scrollTop -= 40;
				break;
			case 'DOWN':
				scrollable.scrollTop += 40;
				break;
			case 'LEFT':
				moveTop()
				break;
			case 'RIGHT':
				moveDown()
				break;
			default:
				break;
		}
	}

	app.update = function(){
		updateImages();
	}

	app.enter = function() {
		const action = $('.loop-item.active').data('action');
		const imageIndex = $('.loop-item.active').data('image-index');

		// console.log('Action is: ', action);


		if (imageMenuIsOpen) {
			const menuAction = $('#app-images-app i.active').data('action');
			const image = Phone.photos[activeIndex];

			if (menuAction === 'remove_image') {
				Phone.emitClientEvent(menuAction, image);
				app.close();
				app.move('RIGHT');
			} else {
				app.activeIndex = imageOpenedIndex;
				Phone.nextAction = menuAction;
				safeClose();
				closeImageMenu();
				closeImage();
        Phone.opened = ['home'];
				Phone.open('contacts');
			}

		} else if (imageIsOpen) {
			// console.log('Opening image menu');
			openImageMenu();
		} else if (action === 'open_image') {
			openImage(imageIndex);
		}
  }
  
	app.close = function() {

		if (imageMenuIsOpen) {
			closeImageMenu();
			return;
		}
		
		if (imageIsOpen) {
			closeImage();
			return;
		}

		activeIndex = -1;
		safeClose();
		$.post('http://esx_phone3/release_focus');
		return true;
	}


	function safeClose () {
    $.post('http://esx_phone3/release_focus');

    $('#phone').removeClass('camera-app-landscape');
		$('#phone').removeClass('camera-app-portrait');
		
    setTimeout(() => {
			$('#phone').removeClass('camera-app-position');
    }, 500);
    setTimeout(() => {
			$('#phone').removeClass('slideInUp');
    }, 1200);
	}

	function moveTop () {

		if (imageMenuIsOpen) {
			const activeLi = $('#app-images-app i.active');
			$('#app-images-app i').addClass('active');
			activeLi.removeClass('active');
			return;
		}

		if (imageIsOpen) {
			let newIndex = imageOpenedIndex - 1;
			if (newIndex < 0) {
				openImage(Phone.photos.length - 1);
			} else {
				openImage(newIndex);
			}
			return;
		}

		if (activeIndex - 1 < 0) {
			activeIndex = moveList.length - 1;
		} else {
			activeIndex = activeIndex - 1;
		}

		setActive();
	}

	function moveDown () {

		if (imageMenuIsOpen) {
			const activeLi = $('#app-images-app i.active');
			$('#app-images-app i').addClass('active');
			activeLi.removeClass('active');
			return;
		}

		if (imageIsOpen) {
			let newIndex = imageOpenedIndex + 1;
			// console.log('new index: ', newIndex);
			if (newIndex >= Phone.photos.length) {
				openImage(0);
			} else {
				openImage(newIndex);
			}
			return;
		}


		if (activeIndex + 1 >= moveList.length) {
			activeIndex = 0;
		} else {
			activeIndex = activeIndex + 1;
		}

		setActive();
	}

	function setActive () {
		$('.loop-item').removeClass('active');
		$(moveList[activeIndex]).addClass('active');
	}

	function updateImages () {
		$('#app-images-app .main-list').empty();
		const photos = Phone.photos;
		const dateList = [];

		if (!photos.length) {
			$('#app-images-app .main-list').append('<h3>Inga bilder</h3>');
		}

		photos.forEach((photo, index) => {
			const time = parseInt(photo.time + '000');
			const date = new Date(time);
			photo.index = index;

			const pushedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

			const found = dateList.find(x => x.date === pushedDate );

			const options = { year: 'numeric', month: 'long', day: 'numeric' };
			const readableDate = date.toLocaleDateString('sv-SE', options);

			if (found){
				found.photos.push(photo);
			} else {
				dateList.push({
					date: pushedDate,
					readableDate,
					photos: [photo]
				});
			}
		});

		dateList.sort((x, y) => {
			// console.log('Sorting datelist');
			if (x.date > y.date) {
				return -1;
			}
			return 1;
		});


		// console.log('Datelist is: ', dateList);

		dateList.forEach(dateItem => {
			const mainUL = $('<ul></ul>').addClass('first-list');
			const imagesUL = $('<ul></ul>').addClass('second-list');

			mainUL.append(`<span>${dateItem.readableDate}</span>`);

			dateItem.photos.forEach(photo => {
				const div = $(`<div></div>`).on("load", function() {
					// image loaded here
				})
				.css({backgroundImage: `url(${photo.link})`})
				.addClass('image-div loop-item')
				.data('action', 'open_image')
				.data('image-index', photo.index)


				const li = $('<li></li>').append(div);
				imagesUL.append(li);
			});

			mainUL.append(imagesUL);
			$('#app-images-app .main-list').append(mainUL);
		});

		/* Set the moveList */
		moveList = $('.loop-item');
	}

	function openImage (index) {
		const photo = Phone.photos[index];
		if (!photo || !photo.link) {
			return;
		}		

		imageIsOpen = true;
		imageOpenedIndex = index;
		$('#image-holder').css({
			backgroundImage: `url(${photo.link})`
		});

		$('#phone').removeClass('slideInUp');

		var img = new Image();
		img.onload = () => {
			const imageIsLandscape = img.width > img.height;
			const type = imageIsLandscape ? 'landscape' : 'portrait';

			$('#image-holder').removeClass('landscape', 'portrait')
			$('#image-holder').addClass(type)

			/* Transform phone */
			$('#phone').addClass('camera-app-position');
			
			setTimeout(() => {
				$('#phone').addClass(`camera-app-${imageIsLandscape ? 'landscape' : 'portrait'}`);
				$('#phone').removeClass(`camera-app-${!imageIsLandscape ? 'landscape' : 'portrait'}`);
			}, 400);

		}
		img.src = photo.link;
	}

	function closeImage () {
		imageIsOpen = false;
		safeClose();
		$('#image-holder').css({
			backgroundImage: 'none'
		});
	}

	function openImageMenu () {
		imageMenuIsOpen = true;
		$('#app-images-app i')
		.removeClass('active');
		$('#app-images-app i').first().addClass('active');

		$('#app-images-app .image-menu')
		.addClass('show')
		.removeClass('hide')

	}

	function closeImageMenu () {
		imageMenuIsOpen = false;
		$('#app-images-app .image-menu')
		.addClass('hide')
		.removeClass('show')
	}

})();
