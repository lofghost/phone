(function(){

	Phone.apps['companies']	= {};
	const app				= Phone.apps['companies'];
	let app_state			= 'NO_DATA';
	const LOADING 			= 'LOADING';
	const GOT_DATA 			= 'GOT_DATA';
	const ul 				= $('#company_list');
	let currentCursorPos 	= -1;
	let chart				= null;

	app.open = function(data) {
		updateState(LOADING);
		$.post('http://esx_phone3/load_companies');
	}

	app.move = function(direction) {
		const list 		= $('#app-companies li:visible');
		const length 	= list.length;

		if(direction === 'TOP'){
			if(currentCursorPos > 0)
				currentCursorPos -= 1;
			else
				currentCursorPos = list.length -1;
		} else if(direction === 'DOWN'){
			if(currentCursorPos < list.length - 1)
				currentCursorPos += 1;
			else
				currentCursorPos = 0;
		}

		list.removeClass('selected');
		list.eq(currentCursorPos).addClass('selected');
	}

	app.enter = function() {

		if($('#company_item').is(':visible')){
			return;
		}

		let company = $('#app-companies li.selected').data('company');
		if(!company){
			return;
		}
		let infoDiv = $('.company_info');
		infoDiv.empty();

		console.log('Company: ', company);
		$('#company_item').show();
		$('#company_item h2').text(company.name);

		$('.companyWorthText').text(moneyStr(company.worth, true));

		$('<div />').append(`<span>Antal anställda</span> <span>${company.workers}</span>`).appendTo(infoDiv);
		$('<div />').append(`<span>Värde per anställd</span> <span>${moneyStr(Math.floor(company.worth / company.workers), true)}</span>`).appendTo(infoDiv);

		createChart(company);

	}

	app.update = function(data) {
		console.log('Data: ' + JSON.stringify(data));
		/* Start to check if we recieved any data */
		if(!data.length) {
			updateState(LOADING);
			return false;
		}

		updateState(GOT_DATA);

		console.log('Updating companies in the app.');

		/* Sorting data */
		data.sort((x, y) => {
			if(x.worth > y.worth){
				return -1;
			} else {
				return 1;
			}
		})

		ul.empty();
		$.each(data, (index, company) => {

			if( !company.name ){ return }

			company.workers = Object.size(JSON.parse(company.workers));

			let li = $('<li />').appendTo(ul).data('company', company); /* Setting the data */
			$('<div />').append(`<span> ${company.name} </span> <span> ${moneyStr(company.worth, true)} </span>`).appendTo(li);
			worthChange(JSON.parse(company.worthHistory)).appendTo(li);

		});
	}

	app.close = function() {

		/* Remove chart */
		if(chart){
			chart.destroy();
		}

		if($('#company_item:visible').length){
			console.log('Closing item');
			$('#company_item').hide();
			return;
		}

		/* Set back the status bar to initial colors */
		$('.status-bar ul.signal li').css('background', '');
		$('.status-bar').css('background', '').css('color', '');
		/* Return true to close the app */
		return true;
	}

	function updateState(state){
		app_state = state;
		/* Update spinner aswell */
		if(app_state === LOADING){
			$('.spinner').show();
			$('.companies-header').hide();
		} else {
			$('.companies-header').show();
			$('.spinner').hide();
		}
	}

	function worthChange(obj){
		let span = $('<span />').addClass('companyValueSpan');

		let change = 0;
		let latestValue;

		for(let key in obj){
			let val = obj[key];
			console.log('latestValue is: ' + latestValue);
			console.log('val is: ' + val);
			change = (val - latestValue) / latestValue * 100;
			latestValue = val;
		}

		if(change > 0){
			// $('<i class="fa fa-chevron-up" />').appendTo(span);
			span.addClass('positive');
		} else {
			// $('<i class="fa fa-chevron-down" />').appendTo(span);
			span.addClass('negative');
		}
		console.log('Change is: ' + change);
		span.append(change.toFixed(2) + '%');
		return span;
	}

	function moneyStr(value, whole_int){
	    if(!value){
	        console.log('Value is: ', value);
	        return 0 + '.00 SEK'
	    }
	    value = value.toString();
	    if(value.length === 5){
	        value = value.substr(0, 2) + ' ' + value.substr(2);
	    } else if(value.length === 6){
	        value = value.substr(0, 3) + ' ' + value.substr(3);
	    } else if(value.length === 7){
	        value = value.substr(0, 1) + ' ' + value.substr(1, 3) + ' ' + value.substr(4);
	    } else if(value.length === 8){
	        value = value.substr(0, 2) + ' ' + value.substr(2, 3) + ' ' + value.substr(5);
	    }

	    return whole_int ? value + ' SEK': value + '.00 SEK';
	}

	function createChart(company) {

		let chartCTX = $("#company_chart");
		chartCTX.empty();

		let data = JSON.parse(company.worthHistory);
		let sortable = [];
		/* Limit the object */
		data = Object.limit(data, 7); /* Returns a new object, limited to the last items */


		/* Sort the data based on key */
		for(let key in data){
			sortable.push([key, data[key]]);
		}

		sortable.sort((x, y) => {
			if(x[0] > y[0]){
				return 1;
			} else {
				return -1;
			}
		});

		let labels = [];
		let values = [];

		for(let obj of sortable){

			console.log(JSON.stringify(sortable));
			labels.push(getChartDate(obj[0] - 0));
			// labels.push('');
			values.push(obj[1]);
		}


		chart = new Chart(chartCTX, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: '',
					data: values,
					pointBackgroundColor: 'rgba(42, 133, 208, 0.5)',
					borderColor: 'rgba(42, 133, 208, 0.8)',
					backgroundColor: 'rgba(42, 133, 208, 0.2)',
					fill: false
				}]
			},
			options: {
				layout: {
					padding: {
						top: 10,
						left: 12,
						right: 12,
						bottom: 10
					}
				},
				legend: {
					display: false
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							suggestedMin: 45000,
							suggestedMax: 250000
						},
						display: false,
						gridLines: {
							display: false
						},
					}],
					xAxes: [{
						ticks: {
							maxTicksLimit: 4,
							padding: 10
						},
						display: false,
						gridLines: {
							display: false
						},
					}]
				},
				responsive: true,
				maintainAspectRatio: true
			}
		});

	}

})();

Object.limit = function(old_obj, limit) {
    let obj = Object.assign({}, old_obj);
    let size = Object.size(obj);
    let ks = Object.keys(obj);

    if(size > limit){
        for(let i = 0; i < size; i++){
            if(i < (size - limit)){
                delete obj[ks[i]];
            }
        }
    }
    return obj;
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function getChartDate(date){

    if(typeof date === 'number'){
        date = new Date(date);
    }

    let month = (date.getMonth() + 1);
    if(month < 10){
        month = '0' + month;
    }
    let day = (date.getDate());
    if(day < 10){
        day = '0' + day;
    }
    return month + '/' + day;

}
