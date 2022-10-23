(function () {

	Phone.apps['twitter'] = {};
	const app = Phone.apps['twitter'];
	let twitterName = null;
	let passedImageCheck = false;
	let passedNameCheck = false;

	app.open = function (data) {
		if (Phone.twitterName) {
			$.post('http://esx_phone3/load_tweets'); /* DEBUG */
			// loadTweets();
			showFeed();
			loadUser();
			$('#app-twitter .mainIcon').hide();
		} else {
			$('#app-twitter .mainIcon').show();
			//console.log('Inget twitternamn i Phone');
		}
	}

	app.move = function (direction) {
		switch (direction) {
			case 'TOP':
				return goUp();
			case 'DOWN':
				return goDown();
			default:
				return;
		}
	}

	app.update = function (data) {
		//console.log('Updating tweets');

		if (!data) {
			return false;
		}

		if (data.twitterCheck) {
			if (data.passed) {
				passedNameCheck = true;
				passedCheck('name');
			} else {
				passedNameCheck = false;
				failedCheck('name');
			}
		} else {
			loadTweets(data);
		}

	}

	app.enter = function () {
		$('.iterableListItem.active:visible').trigger('click');

		if ($('#twitterFeed').is(':visible')) {
			hideFeed();
			composeTweet();
		}
	}

	app.close = function () {
		//console.log('CLosing twitter.');

		if ($('#registerDiv').is(':visible')) {
			$('#registerDiv').hide().css({
				right: '100%'
			});
			$('.twitterMainDiv').show();
			return;
		}

		if ($('#composeTweet').is(':visible')) {
			$('#composeTweet').hide()
			showFeed();
			$.post('http://esx_phone3/release_focus');
			return;
		}

		$('.status-bar ul.signal li').css('background', '');
		$('.status-bar').css('background', '').css('color', '');
		$.post('http://esx_phone3/release_focus');
		Phone.twitter.lastClosed = Date.now();
		return true;
	}

	$('#app-twitter input').first().keypress(e => {
		if (e.which == 13) {
			//console.log('Stop going.');
			$('#app-twitter input').last().focus();
		}
	});

	$('#app-twitter input').first().focus(e => {
		$('#app-twitter #registerDiv button').removeClass('active');
	});

	$('#app-twitter input').last().keypress(e => {
		if (e.which == 13) {
			//console.log('I am last.');
			$('#app-twitter input').last().blur();
			$('#app-twitter #registerDiv button').addClass('active');
		}
	});

	$('#getGoingBtn').click(e => {
		$(e.currentTarget).removeClass('active');
		$('#registerDiv').show().animate({ right: 0, opacity: 1 });
		$.post('http://esx_phone3/request_input_focus');
		setTimeout(function () {
			$('.twitterMainDiv').hide();
		}, 500);
	});


	$('#tweetNameInput').change(e => {

		let val = e.currentTarget.value;

		if (val.length > 3 && typeof val === 'string' && val.match(/^[a-zA-Z0-9]+$/g)) {
			loadingCheck('name');
			/* Start the loading check. */
			/* Now we wait for the update twitter name. */

			setTimeout(function () {
				if (val.length > 10) {
					passedNameCheck = false;
					failedCheck('name');
				} else {
					$.post('http://esx_phone3/check_twitter_name', JSON.stringify(val));
				}
			}, 500);

		} else if (val) {
			passedNameCheck = false;
			failedCheck('name');
		}

	});

	$('#tweetImgInput').change(e => {

		let val = e.currentTarget.value;

		if (val.length > 3 && typeof val === 'string' && !val.includes(' ') && (val.includes('.jpg') || val.includes('.jpeg') || val.includes('.png'))) {
			validateImage('https://i.imgur.com/' + val)
				.then(result => {

					if (result) {
						passedCheck('image');
						passedImageCheck = true;
					} else {
						failedCheck('image');
						passedImageCheck = false;
					}
				});

		} else {
			failedCheck('image');
			passedImageCheck = false;
		}

	});

	$('#registerTwitterBtn').click(e => {
		//console.log('Du reggar dig. ');
		$(e.currentTarget).removeClass('active');
		if (passedImageCheck && passedNameCheck) {

			/* Register user. */
			//console.log('You passed the checks.');
			$.post('http://esx_phone3/load_tweets');
			$.post('http://esx_phone3/register_twittername', JSON.stringify({ name: $('#tweetNameInput').val(), time: Date.now(), identifier: Phone.identifier, img: $('#tweetImgInput').val() }));
			Phone.twitterName = $('#tweetNameInput').val();
			Phone.twitterImg = $('#tweetImgInput').val();
			$('#app-twitter .mainIcon').hide();
			$('#registerDiv input').val('');
			$('.twitterMainDiv').hide('');
			$('#registerDiv').hide('');
			$('#imgurSpan').hide();
			loadUser();
			showFeed();
		} else {
			if (!passedImageCheck) {
				failedCheck('image');
			}
			if (!passedNameCheck) {
				failedCheck('name');
			}
			//console.log('You did not pass the checks.');
		}

	});

	$('#registerDiv .avbrytSpan').click(e => {
		$('#registerDiv').animate({ right: '100%', opacity: 0 });
		$('.twitterMainDiv').show();
	});

	/* Focus & blur events */
	$('#registerDiv input').last().focus(e => {
		$('#app-twitter #registerDiv button').removeClass('active');
		let val = $(e.currentTarget).val();
		$(e.currentTarget).css('width', 'calc(52% + 1px)');
		$('#imgurSpan').show().text('imgur.com/').css({ marginRight: '-4px', color: '#1da1f2' });
	});

	$('#registerDiv input').last().blur(e => {
		let val = $(e.currentTarget).val();
		if (!val) {
			$(e.currentTarget).css('width', '85%');
			$('#imgurSpan').hide();
		} else {
			$('#imgurSpan').css('color', '#232323');
		}
	});




	/* Functions */
	function failedCheck(type) {
		/* Name / Image */
		//console.log('Failed check. Type: ', type);
		if (type === 'image') {
			let imageCheck = $('#tweetImgInput + .fa-lg');
			imageCheck.removeClass('fa-check fa-circle-o-notch fa-spin').addClass('fa-times').show();
		} else {
			let nameCheck = $('#tweetNameInput + .fa-lg');
			nameCheck.removeClass('fa-check fa-circle-o-notch fa-spin').addClass('fa-times').show();
		}
	}

	function passedCheck(type) {
		/* Name / Image */
		//console.log('Passed check. Type: ', type);
		if (type === 'image') {
			let imageCheck = $('#tweetImgInput + .fa-lg');
			imageCheck.removeClass('fa-times fa-circle-o-notch fa-spin').addClass('fa-check').show();
		} else {
			let nameCheck = $('#tweetNameInput + .fa-lg');
			nameCheck.removeClass('fa-times fa-circle-o-notch fa-spin').addClass('fa-check').show();
		}
	}
	function loadingCheck(type) {
		/* Name / Image */
		if (type === 'image') {
			let imageCheck = $('#tweetImgInput + .fa-lg');
			imageCheck.removeClass('fa-times fa-check').addClass('fa-circle-o-notch fa-spin').show();
		} else {
			let nameCheck = $('#tweetNameInput + .fa-lg');
			nameCheck.removeClass('fa-times fa-check').addClass('fa-circle-o-notch fa-spin').show();
		}
	}


	function showFeed() {
		let feed = $('#twitterFeed');
		$('.twitterMainDiv').hide();
		$('#app-twitter mainIcon').hide();
		feed.show();
	}

	function hideFeed() {
		let feed = $('#twitterFeed').hide();
		$('.twitterFeedHeader img:last-child').off();
	}

	function showCompose() {
		$('#composeTweet').show();
	}
	function hideCompose() {
		$('#composeTweet').hide();
		$('#composeTweet textarea').val('');
		showFeed();
	}


	function loadTweets(list) {
		// let img = 'Rl7lsJ9.jpg';
		// list = [{sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000}, {sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000}, {sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000}, {sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000}, {sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000}, {sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000}, {sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000}, {sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000}, {sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000},{sender: 'Kungen', img, message: 'Hallå där! Välkommen Berra!', verified: 1, time: Date.now() - 500000},{sender: 'Berra', img, message: 'Tack som fan, du e grym.', verified: 0, time: Date.now() - 800000}, {sender: 'Kungen', img, message: '@berra Fan va gött att höra', verified: 1, time: Date.now() - 8050000}];

		list = list.sort((x, y) => {
			if (x.time > y.time) {
				return -1;
			} else {
				return 1;
			}
		});

		Phone.twitter.tweets = list;

		let ul = $('#twitterFeedList');
		ul.empty();

		$.each(list, (index, value) => {
			let verified = value.verified;
			let li = $('<li />').appendTo(ul).addClass('iterableListItem');

			/* Set image */

			$('<img />').attr('src', 'https://i.imgur.com/' + value.img).appendTo(li);

			let holder = $('<div />').addClass('twitterHolder').appendTo(li);
			let holderHeader = $('<div />').addClass('twitterHolderHeader').appendTo(holder);
			$('<span />').text(value.sender).appendTo(holderHeader);
			if (verified) {
				$('<img src="./img/apps/icons/verified.png">').addClass('verifiedImage').appendTo(holderHeader);
			}
			$('<span />').addClass('tweetAtSpan').text(' @' + value.sender.toLowerCase()).appendTo(holderHeader);
			$('<div />').addClass('twitterDot').appendTo(holderHeader);

			$('<span />').text(getTweetTime(value.time)).appendTo(holderHeader);

			let str = value.message;
			let at = false;
			if (str.charAt(0) === '@') {
				at = true;
				str = str.split(' ')[0];
				value.message = value.message.replace(str, '');
			}

			$('<span />').text(value.message).appendTo(holder).prepend(at ? $('<b />').text(str) : '');


		});
	}


	function loadUser() {
		$('.twitterFeedHeader > img:first-child').attr('src', 'https://i.imgur.com/' + Phone.twitterImg);
		$('.composeTweetDiv > img:first-child').attr('src', 'https://i.imgur.com/' + Phone.twitterImg);
	};

	function composeTweet() {
		showCompose();
		$('textarea').focus();
		$.post('http://esx_phone3/request_input_focus');
	}

	$('#app-twitter textarea').keyup(e => {
		let lnt = e.currentTarget.value.length > 2;
		if (e.which == 13) {
			if (e.shiftKey) {
				//console.log('New line!');
			} else {
				if (lnt) {
					let message = e.currentTarget.value;
					$('#composeTweet textarea').val('');

					if (message.charAt(0) === '@') {
						let atUser = message.split(' ')[0];
						$.post('http://esx_phone3/tweet_at_user', JSON.stringify(atUser));
					}
					//console.log('Posting tweet');
					$.post('http://esx_phone3/post_tweet', JSON.stringify({ verified: Phone.twitterVerified, img: Phone.twitterImg, sender: Phone.twitterName, message, time: Date.now() }));

					setTimeout(function () {
						hideCompose();
						$('#app-twitter > .app-inner .twitterFeedHeader button').css('background-color', '#96d7ff');
						$.post('http://esx_phone3/release_focus');
						$.post('http://esx_phone3/load_tweets');
					}, 20)
				}

			}
		}

		if (lnt) {
			$('#app-twitter > .app-inner .twitterFeedHeader button').css('background-color', '#1da1f2');
		} else {
			$('#app-twitter > .app-inner .twitterFeedHeader button').css('background-color', '#96d7ff');
		}


	});

	function updateFeed() {
		//console.log('Updating feed.');
		showFeed();
	}

	function getTweetTime(time) {
		let difference = Date.now() - time;

		let seconds = Math.floor(difference / 1000);
		let minutes = Math.floor(difference / 1000 / 60);
		let hours = Math.floor(difference / 1000 / 60 / 60);
		let days = Math.floor(difference / 1000 / 60 / 60 / 60);

		if (days >= 1) {
			return days + 'd'
		} else if (hours >= 1) {
			return hours + 'h';
		} else if (minutes >= 1) {
			return minutes + 'm';
		} else {
			if (seconds < 5) {
				return 'nu';
			}
			return seconds + 's';
		}
	}

	/* Menu movement functions */
	function goDown() {

		//console.log('Going down.');
		$('div.iterableListItem.active:visible > input').blur();
		let curr = $('#app-twitter .iterableListItem.active:visible');
		if (curr.length) {
			if (curr.is(':last-child')) {
				curr.removeClass('active');
				$('#app-twitter .iterableListItem:visible').first().addClass('active');
			} else if (curr.next().hasClass('iterableListItem')) {
				curr.removeClass('active').next().addClass('active');
			} else {
				curr.removeClass('active').next().next().addClass('active');
			}
		} else {
			$('#app-twitter .iterableListItem:visible').first().addClass('active');
		}
		$('div.iterableListItem.active:visible > input').focus();

		if ($('#twitterFeed').is(':visible')) {
			scrollFeed();
		}
	}

	function goUp() {
		$('div.iterableListItem.active:visible > input').blur();
		let curr = $('#app-twitter .iterableListItem.active:visible');
		if (curr.length) {
			if (curr.is(':first-child')) {
				curr.removeClass('active');
				$('#app-twitter .iterableListItem:visible').last().addClass('active');
			} else if (curr.prev().hasClass('iterableListItem')) {
				curr.removeClass('active').prev().addClass('active');
			} else if (curr.prev().prev().hasClass('iterableListItem')) {
				curr.removeClass('active').prev().prev().addClass('active');
			} else {
				curr.removeClass('active');
			}
		} else {
			$('#app-twitter .iterableListItem:visible').last().addClass('active');
		}
		$('div.iterableListItem.active:visible > input').focus();

		if ($('#twitterFeed').is(':visible')) {
			scrollFeed();
		}

	}

	function scrollFeed() {
		let doc = document.getElementsByClassName('iterableListItem active');
		if (doc.length) {
			doc[0].scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: 'start'
			});
		}
	}


	function validateImage(input) {

		return new Promise((resolve, reject) => {
			//console.log('Input was: ', input);
			let image = new Image();
			image.src = input;

			image.onload = function () {

				//console.log('Image: ', image);
				if (image.width === 161 && image.height === 81) {
					//console.log('I think it is bad image');
					resolve(false);
				} else {
					//console.log('I think it is real image');
					resolve(true);
				}

			};

		});
	}


})();
