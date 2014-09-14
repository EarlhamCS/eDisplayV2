// requires google.visualization
helper = {};
helper.charts = {}; // this can be implemented in the future if desired
helper.html = {}; // this can be implemented in the future if desired
helper.decimal = {};
helper.html = {};
helper.date = {};
log = {};

// returns val if arg is undefined
// useful for creating default/optional arguments
helper.getDefaultArgument = function(arg, val) {
	if(typeof arg !== 'undefined')
		return arg;
	else
		return val;	
};

log.enabled = true;

log.methods = {
	log : 0,
	info : 1,
	warning : 2,
	error : 3
}

log.message = function(str, method) {
	if(typeof method === 'undefined')
		method = log.methods.log;

	if(log.enabled) {
		if(method == log.methods.log)
			console.log(str);
		else if(method == log.methods.info)
			console.info(str);
		else if(method = log.methods.warning)
			console.warn(str);
		else if(method == log.methods.error)
			console.error(str);
		else
			console.log(str);
	}
}

log.start = function(str, method) {
	log.message(log.prefix("start", str), method);
}

log.finish = function(str, method) {
	log.message(log.prefix("finish", str), method);
}

log.function = function(str, method) {
	log.message(log.prefix("function", str), method);
}

log.prefix = function(prefix, str) {
	return prefix + " - " + str;
}

helper.setElementSize = function(id, width, height) {
	helper.setElementWidth(id, width);
	helper.setElementHeight(id, height);
}

helper.setElementHeight = function(id, height) {
	document.getElementById(id).style.height = height;
}

helper.setElementWidth = function(id, width) {
	document.getElementById(id).style.width = width;	
}

// chart: google charts chart
// row: x position on chart
// value: y position on chart
// element: dom element
helper.html.setMarker = function(chart, value, row, element) {
	var cli = chart.getChartLayoutInterface();
	
	var top = Math.floor(cli.getYLocation(value)) + "px";
	element.style.top = top;

	var left = Math.floor(cli.getXLocation(row)) + "px";
	element.style.left = left;

	log.message("setting marker to x: " + left + " y: " + top, log.methods.info)
};

// sets chart min/max intelligently
helper.setChartMaximum = function(enabled, chart, min, max) {
	if(enabled) {
		chart.setOption("vAxis.viewWindowMode", "explicit");
		
		if(typeof min != "undefined") {
			chart.setOption("vAxis.viewWindow.min", min);
		}
		
		if(typeof max != "undefined") {
			chart.setOption("vAxis.viewWindow.max", max);
		}
	} else {
		chart.setOption("vAxis.viewWindowMode", "pretty");
	}
};

// casts a number to fixed percision
helper.decimal.toFixed = function(number, decimal_places) {
	decimal_places = helper.getDefaultArgument(decimal_places, 2);
	
	// round it and fix decimal places
	return parseFloat(number).toFixed(decimal_places);
};

// iterates through a datatable and formats all data
// format_options is used to create a google.visualization.NumberFormat
// start indicates which column to begin on
helper.formatNumbers = function(table, format_options, start) {
	start = helper.getDefaultArgument(start, 0)

	var formatter = new google.visualization.NumberFormat(format_options);
	var cols = table.getNumberOfColumns();

	for(var i = start; i < cols; i++) {
		formatter.format(table, i);
	}
};

// accepts error message for google charts
helper.errorHandler = function(errorMessage) {
	// an alternative solution that's very heavy handed
	//$("*[id\^='google\-visualization\-error']*").hide();

	//console.log(errorMessage);
	google.visualization.errors.removeError(errorMessage.id);
};

// casts a 2d array (data) to numbers
// if isDate is true, the first column will be casted to dates
helper.castData = function(data, isDate) {
	// default isDate	
	if(typeof isDate == "undefined")
		isDate = false;

	for(row = 1; row < data.length; row++) {
		if(isDate) {
			// changes 2014-01-01-06 into 2014/01/01
			// makes data acceptable on chrome, firefox, and IE			
			data[row][0] = data[row][0].slice(0, -3).replace(/-/g, '/');
			
			// cast data
			data[row][0] = new Date(data[row][0]);
		} else {
			data[row][0] = parseInt(data[row][0]);
		}
		
		for(col = 1; col < data[row].length; col++) {
			data[row][col] = Number(data[row][col]);
		}
	}
	
	return data;
};

// expects a 2d array with columns "area, color"
// and an array of areas used
// names must correlate to each other
helper.getUsedColors = function(used, colors) {
	var arr = new Array();
	var count = 0;

	for(i = 0; i < used.length; i++) {
		for(row = 1; row < colors.length; row++) {
			if(used[i] == colors[row][0]) {
				arr[count] = colors[row][1];
				count++;
				break;
			}
		}
	}
	
	return arr;
};

// tables: 2d array of file data
// aggregate: the selected aggregate
// indexAggregate: index of aggregate in file_data
// interval: size of range
// indexInterval: index of range in file_data
helper.getFileForResolution = function(file, file_data, interval) {
	var smallest_index;
	var smallest_distance;
	
	for(r = 0; r < file_data.length; r++) {
		if(	file_data[r].isDate != file.isDate ||
			file_data[r].aggregate != file.aggregate ||
			isNaN(file_data[r].interval)) {
				continue;
		}
		
		smallest_index = r;
		smallest_distance = Math.abs(interval - file_data[r].interval);
	}
	
	for(r = 0; r < file_data.length; r++) {
		if(	file_data[r].isDate != file.isDate ||
			file_data[r].aggregate != file.aggregate ||
			isNaN(file_data[r].interval)) {
				continue;
		}
		
		var current_distance = Math.abs(interval - file_data[r].interval);
			
		if(current_distance < smallest_distance) {
			smallest_index = r;
			smallest_distance = current_distance;
			//console.log(r + " " + file_data[r] + " with " + current_distance);
		}
	}

	//console.log(smallest_distance + " from " + file_data[smallest_index].interval + " with " + file_data[smallest_index].formatted);
	return file_data[smallest_index];
};

helper.date.daydiff = function(first,second) {
	return (second-first) / (1000*60*60*24);
};