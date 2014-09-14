// Used to create an edisplay.
// Constructed from modular parts.

// required libraries:
/*
 jquery
 https://www.google.com/jsapi
 
 io.js
 helper.js
 energy.js
 interval.js
 columnFilter.js
 listFilter.js
 rangeFilter.js
 chart.js
 */

google.load('visualization', '1.0', {'packages':['corechart', 'controls']});
google.setOnLoadCallback(initialize);

// charts
var dashboard;
var chart;
var cumulative;

// controls
// var file;
var range;
var aggregate;
var buttons;

// files on the server
var files;
var file_types;
var file_data;
var file_data_header;
var file_current;
var file_cumulative;
var file_default_range = "day";

// variables
var colors_file = "column_colors.csv";

// options for chart
var chart_options = {
	chartType:'LineChart',
	containerId:'line',
	options : {
		width:'100%',
		title: 'Electricity Usage',
		selectionMode:'single',
		areaOpacity:0.2,
		lineWidth:3,
		pointShape:'circle',
		pointSize:0,
		chartArea: {
				left:"10%", top:"10%", width:"90%", height:"80%"
			},
		explorer: {
				actions: [
					'dragToZoom',
					'rightClickToReset'
				],
				keepInBounds: true,
				zoomDelta: 0.5,
				maxZoomIn: 0.2,
				maxZoomOut: 1
			},
		vAxis: {
			format: "#,##0 kw/h",
			minValue: 0
		},
		legend: {
			position: 'none'
		}
	}
};

// options for cumulative
var cumulative_options = {
//	chartType:'BarChart',
//	containerId:'cumulative',
//	options: {
		width: '100%',
		height: '100%',
		title: 'Cumulative',
		selectionMode: 'single',
		legend: {
			position: 'none'
		},
		chartArea: {
			left:"10%", top:"10%", width:"80%", height:"70%"
		},
		bar: {
			groupWidth:"100%"
		},
		vAxis: {
			format:"#,##0 kw/h",
			logScale:'true',
			baselineColor:'transparent',
			gridlines: {
				color:'transparent'
			},
			minorGridlines: {
				color:'transparent'
			}
		},
		hAxis: {
			//format:"##E00 kw/h",
			//format:"###,###,##0 kw/h",
			format:"#,###.## million kw/h",
			minValue:0,
			slantedText:true,
			slantedTextAngle:90,
			
			gridlines: {
				count:3
			}
		},
		tooltip: {
			isHtml: true,
			trigger:'hover'
		},
//		enableInteractivity: 'false'
		focusTarget: 'datum'
//	}
};

// options for the range
var range_options = {
	controlType:'ChartRangeFilter',
	containerId:'range_filter',
	options:{
		filterColumnLabel:'Date',
		ui:{
			chartType:'AreaChart',
			chartOptions:{
				chartArea:{
					left:'0%', top:'0%',
					width:'100%', height:'100%'
				}
			},
			snapToData:'true'
		}
	}
}

// --- functions used by events --- //
// --- functions used by events --- //
// --- functions used by events --- //
// --- functions used by events --- //
// --- functions used by events --- //

function aggregateChange() {
	clearEnergyStatistics();

	if(file_current) {
		loadData(getFile(file_current.formatted));
	} else {
		loadData(getFile(file_default_range));
	}
}

// TODO: why doesn't the range filter match our colors?
function columnChange() {
	log.function("columnChange()", log.methods.info);
	chart.columnChange();

	range.filter.setOption("colors", chart.chart.getOption("colors"));
	
	draw();
	clearEnergyStatistics();
}

// TODO: errors on zoom
// chart.chart.getChart() becomes null
function getEnergyStatistics() {
	if(!chart.chart.getChart()) {		
		return;
	}
	
	var selection = chart.chart.getChart().getSelection()[0];
	var marker = document.getElementById("line_marker");
	
	if(typeof selection == "undefined" || typeof selection == "null") {
		marker.style.display = "none";
		return;
	} else {
		marker.style.display = "block";
	}

	range.interval.fromRangeFilter(range.filter);
	
	var data = chart.view;
	var start = String(range.interval.start);
	var start_index;
	var current;
	var kwh = 0;

	for(r = 0; r < data.getNumberOfRows(); r++) {
		//console.log(String(data.getValue(r, 0)) + " == " + start);
		if(String(data.getValue(r, 0)) == start) {
			start_index = r;
			current = data.getValue(r + selection.row, 0);
			kwh = data.getValue(r + selection.row, selection.column);
		}
	}
	
	var stats = document.getElementById('energy_statistics');

	document.getElementById('lightbulbHours').innerHTML = "lightbulb hours: " + helper.decimal.toFixed(energy.kwh.toLightbulbHours(kwh));
	document.getElementById('gasolineGallons').innerHTML = "gallons of gasoline: " + helper.decimal.toFixed(energy.kwh.toGallonsOfGasoline(kwh));
	document.getElementById('treesPlanted').innerHTML = "trees planted: " + helper.decimal.toFixed(energy.kwh.toTreesPlanted(kwh));

	helper.html.setMarker(chart.chart.getChart(), kwh, new Date(current), marker);
}

function clearEnergyStatistics() {
	if(chart.chart.getChart()) {
		chart.chart.getChart().setSelection([]);
		getEnergyStatistics();
	}
}

function toggleGlobalMaximum() {
	chart.toggleGlobalMaximum();
	clearEnergyStatistics();
}

// exeucte rangeChange only when
// rangeTime has not been changed for rangeInterval milliseconds
rangeTime = +new Date();
rangeInterval = 200;
function rangeChangeTimed() {
	// refresh the activated time
	rangeTime = +new Date();
	
	// start a timed function
	setTimeout(rangeChangeActivate, rangeInterval + 1);
}

// get the current time and the difference from the last call of rangeChangeTimed
// determines if enough time has passed for rangeChange to be called
function rangeChangeActivate() {
	var current = +new Date();
	var difference = current - rangeTime;

	if(difference > rangeInterval) {
		rangeChange();
	}
}

// loads data for the appropriate resolution
function rangeChange() {
	var redraw = false;
	var state = range.filter.getState();
	var days = helper.date.daydiff(state.range.start, state.range.end);
	var file = helper.getFileForResolution(file_current, file_data, days);

	if(file != file_current) {
		log.message(log.prefix("file changed", file.string), log.methods.info);
		file_current = file;
		chart.setFile(file);
		
		// this fixes interval issues on maximize, but creates issues on minimize
		// range.initialize(file_current, chart.table, range_options);
		
		draw();
		redraw = true;
	}

	clearEnergyStatistics();
	
	return redraw;
}

// moves range left by the current interval
function rangeLeft() {
	range.left();
	draw();
	clearEnergyStatistics();
}

// moves range right by the current interval
function rangeRight() {
	range.right();
	draw();
	clearEnergyStatistics();
}

// sets the interval to the bounds of the range
// TODO: doesn't handle interval changes well; rangeChange problem?
// TODO: causes EnergyStatistics to break due to chart.chart being null?
function rangeMaximize() {
	range.toggleMaximize('btn_zoom');
	draw();
	rangeChange();
	clearEnergyStatistics();
}

/*
// toggles if the left column is displayed or not
left_displayed = true;
function toggleLeftColumn(bool) {
	setLeftColumn(!left_displayed);
}

function setLeftColumn(bool) {
	left_displayed = bool;

	var elements = [document.getElementById('left')];
	
	for(i = 0; i < elements.length; i++) {
		if(bool) {
			elements[i].style.width = "10%";
			elements[i].style.display = "block";
		} else {
			elements[i].style.width = "0%";
			elements[i].style.display = "none";
		}
	}

	setCenterWidth();
	draw();
	clearEnergyStatistics();
}
*/


// toggles if the left column is displayed or not
right_displayed = true;
function toggleRightColumn(bool) {
	setRightColumn(!right_displayed);
}

function setRightColumn(bool) {
	right_displayed = bool;

	var elements = [document.getElementById('right')];
	
	for(i = 0; i < elements.length; i++) {
		if(bool) {
			elements[i].style.display = "block";
			elements[i].style.width = "10%";
		} else {
			elements[i].style.display = "none";
			elements[i].style.width = "0%";
		}
	}

	setCenterWidth();
	draw();
	clearEnergyStatistics();
}

// toggles if range is displayed or not
function toggleRange() {
	range.toggleDisplayed();
	
	if(range.isDisplayed)
		helper.setElementHeight('line', "80%");
	else
		helper.setElementHeight('line', "98%");

	draw();
	clearEnergyStatistics();
}

function setCenterWidth() {
	var width = 93 - 10;
	
	if(right_displayed) {
		width -= 10;
	}
	
	var center = document.getElementById("center");
	center.style.width = width + "%";
}

// standardizes draw calls
var count = 0;
function draw() {
	count++;
	log.function("draw() " + count.toString(), log.methods.info);
	dashboard.draw(chart.view);

	if(cumulative) {
		cumulative.chart.draw(cumulative.table, cumulative_options);
		//console.log("Drawing cumulatve from draw function.");
		//cumulative.dashboard.draw(cumulative.table);
	}
}


// --- core functions --- //
// --- core functions --- //
// --- core functions --- //
// --- core functions --- //
// --- core functions --- //

// returns the array of the file that's currently selected
// gets file name and file aggregate
// which together are a primary key (UID) for the file_data array
function getFile(file_name) {
	var file_aggregate = aggregate.getSelected();
	
	var array;
	
	// iterates through file_data array looking for the correct file
	// the name and aggregate server as a unique ID for the file
	for(i = 0; i < file_data.length; i++) {
		if(file_name == file_data[i].formatted &&
		   file_aggregate == file_data[i].aggregate) {
			
			array = file_data[i];
			break;
		}
	}

	return array;
}

// converts an array of files to an array of objects
// JSON was bothersome, so this is an alternative
function filesToObjects(array) {
	// get headers for file_data
	headers = array.splice(0,1)[0];

	var objects = [];
	
	for(var i = 0; i < array.length; i++) {
		objects.push(fileToObject(array[i], headers));
	}

	return objects;
}

// converts a string array representing a file to an object
// JSON was bothersome, so this is an alternative
function fileToObject(array, h) {
	var o = {};
	var a = array;
	var index = 0;
	
	headers = [
		"string", "formatted", "max",
		"aggregate", "chartType", "isDefault",
		"isDate", "interval"
	]
	
	index = $.inArray("string", h);
	if(index >= 0)
		o.string = a[$.inArray("string", h)];

	index = $.inArray("formatted", h);
	if(index >= 0)
		o.formatted = a[$.inArray("formatted", h)];

	index = $.inArray("max", h);
	if(index >= 0)
		o.max = a[$.inArray("max", h)];

	index = $.inArray("aggregate", h);
	if(index >= 0)
		o.aggregate = a[$.inArray("aggregate", h)];

	index = $.inArray("chartType", h);
	if(index >= 0)
		o.chartType = a[$.inArray("chartType", h)];

	index = $.inArray("isDefault", h);
	if(index >= 0)
		o.isDefault = a[$.inArray("isDefault", h)];

	index = $.inArray("isDate", h);	
	if(index >= 0)
		o.isDate = a[$.inArray("isDate", h)];

	index = $.inArray("interval", h);
	if(index >= 0)
		o.interval = a[$.inArray("interval", h)];

	return o;
}

// the most important function here
// loads data from the file and performs all initialization
function loadData(file) {
	log.start("chart.loadData", log.methods.info);
	
	dashboard = new google.visualization.Dashboard(document.getElementById('dashboard'));

	log.message("making chart", log.methods.info);
	if(!chart) {
		chart = new Chart(file, 'line', chart_options, colors, "column_filter");
		chart.draw = draw;
		google.visualization.events.addListener(chart.column_filter.filter, 'statechange', columnChange);
	} else {
		chart.initialize(file, 'line', chart_options, colors, "column_filter");
	}

	log.message("making cumulative", log.methods.info);
	/*
	if(!cumulative) {
		cumulative = new Chart(file_cumulative, 'cumulative', cumulative_options, colors);
		//cumulative.draw = draw;
	} else {
		//cumulative.initialize(file_cumulative, 'cumulative', cumulative_options, colors);
	}
	*/

	
	if(file_cumulative) {
		cumulative = {};	
		
		cumulative.data = io.getData(file_cumulative.string);
		cumulative.data = io.csvToArray(cumulative.data, ", ");
		cumulative.data = helper.castData(cumulative.data, false);
		cumulative.data[0].splice(0, 0, "index");
		for(r = 1; r < cumulative.data.length; r++) {
			cumulative.data[r].splice(0, 0, r);
			
			for(c = 1; c < cumulative.data[r].length; c++) {
				cumulative.data[r][c] /= 1000000;
				cumulative.data[r][c] = +cumulative.data[r][c].toFixed(2);
			}
		}

		//cumulative.data = [['Bundy', 'Barrett'], [500, 100]];
		
		cumulative.table = new google.visualization.arrayToDataTable(cumulative.data);
		
		cumulative.chart = new google.visualization.BarChart(document.getElementById("cumulative"));
		cumulative.chart.draw(cumulative.table, cumulative_options);
		
		//cumulative.dashboard = new google.visualization.Dashboard(document.getElementById('cumulative_dashboard'));
		//cumulative.chart = new google.visualization.ChartWrapper(cumulative_options);

		//console.log("Drawing cumulatve from init function.");
		//cumulative.dashboard.draw(cumulative.table);
		//console.log(cumulative.table);
		//cumulative.dashboard.draw(cumulative.table);
	}
			
	google.visualization.events.addListener(chart.chart, 'select', getEnergyStatistics);

	// make or initialize range filter
	if(!range) {
		range = new rangeFilter(file, chart.table, range_options);
		google.visualization.events.addListener(range.filter, 'statechange', rangeChangeTimed);
	} else {
		range.initialize(file, chart.table, range_options, file.isDate);
	}
	
	var column_values = [];
	for(i = 1; i < file.data[0].length; i++) {
		column_values.push(file.data[0][i]);
	}

	buttons = new Buttons(column_values, colors, 1);
	element = document.getElementById('column_filter');
	element.innerHTML = "";
	buttons.parent(document.getElementById('column_filter'));
	
	// establish dependencies
	dashboard.bind(range.filter, chart.chart);
	
	draw();
	log.finish("chart.loadData", log.methods.info);
}

function initialize() {
	// get colors of columns
	var text = io.getData(colors_file);
	colors = io.csvToArray(text, "::");

	// get list of available files
	var text = io.getData("files.csv");
	files = io.csvToArray(text, ", ");
	
	// splice first column
	file_types = [];
	for(i = 0; i < files.length; i++) {
		file_types.push(files[i][0]);
		files[i].splice(0,1);
	}

 	// get file data
	var text = io.getData("file_data.csv");
	file_data = io.csvToArray(text, ", ");
	
	// cast files to objects so that they're easier to work with
	file_data = filesToObjects(file_data);

	// cast variables
	for(i = 0; i < file_data.length; i++) {
		var item = file_data[i];
		item.isDate = item.isDate.toLowerCase() == "true";
		item.isDefault = item.isDefault.toLowerCase() == "true";
		item.max = parseFloat(item.max);
		item.interval = parseFloat(item.interval);
	}

	// get cumulative file
	for(i = 0; i < file_data.length; i++) {
		if(file_data[i].formatted == "cumulative") {
			file_cumulative = file_data[i];
			log.message(file_data[i], log.methods.info);
			break;
		}
	}

	// initialize center width
	setCenterWidth();

	// get file's supported aggregates
	var array = files[$.inArray(file_default_range, file_types)];
	
	// initialize aggregate
	if(!aggregate) {
		aggregate = new listFilter("aggregate_filter", array); 
		google.visualization.events.addListener(aggregate.filter, 'statechange', aggregateChange);
	} else {
		aggregate.setData(array);
	}

	// get first file
	file_current = getFile(file_default_range);

	// load data
	loadData(file_current);

	// redraw chart on resize
	if(window.addEventListener) {
		window.addEventListener('resize', draw);
	} else {
		window.attachEvent("onresize", draw);
	}
}