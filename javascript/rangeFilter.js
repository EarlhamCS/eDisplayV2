rangeFilter = function(file, table, options) {
	this.interval;
	this.filter;
	
	this.isDisplayed; // indicates the filter's displayed state	
	this.date_interval; // stores numeric interval for later use
	this.numeric_interval; // stores date interval for later use
	

// moves interval left one step based on current interval
this.left = function() {
	this.interval.fromRangeFilter(this.filter);
	this.interval.step(-1);
	this.interval.toRangeFilter(this.filter);
}

// sets the interval to left/right bounds
// fixes html text for the button
this.setMaximize = function(id, state) {
	this.interval.fromRangeFilter(this.filter);
	this.interval.setMaximize(state);
	this.interval.toRangeFilter(this.filter);

	if(this.interval.maximize) {
		document.getElementById(id).innerHTML = "zoom in";
	} else {
		document.getElementById(id).innerHTML = "zoom out";
	}
}

// sets the interval to left/right bounds
// fixes html text for the button
this.toggleMaximize = function(id) {
	this.interval.fromRangeFilter(this.filter);
	this.interval.maximizeToggle();
	this.interval.toRangeFilter(this.filter);

	if(this.interval.maximize) {
		document.getElementById(id).innerHTML = "zoom in";
	} else {
		document.getElementById(id).innerHTML = "zoom out";
	}
}

// moves interval right one step based on current interval
this.right = function() {
	this.interval.fromRangeFilter(this.filter);
	this.interval.step(1);
	this.interval.toRangeFilter(this.filter);
}

this.toggleDisplayed = function() {
	rfc = document.getElementById('range_filter_container');
	this.isDisplayed = !this.isDisplayed;
	
	if(this.isDisplayed) {
		rfc.style.display = "block";
		rfc.style.height = "15%";
	} else {
		rfc.style.display = "none";
		rfc.style.height = "0%";
	}
}

this.setInterval = function(file, table) {
	// set interval
	if(this.interval) {
		// store current range
		this.interval.fromRangeFilter(this.filter);
		
		// store current interval
		if(this.interval.isDate) {
			this.date_interval = this.interval;
		} else {
			this.numeric_interval = this.interval;
		}
	}

	// set interval to the old interval
	if(file.isDate) {
		this.interval = this.date_interval;
	} else {
		this.interval = this.numeric_interval;
	}

	// set bounds of interval or, if null, declare new interval
	if(this.interval) {
		// set bounds of existing interval
		this.interval.setBounds(
			table.getValue(0, 0),
			table.getValue(table.getNumberOfRows() - 1, 0)
		);
	} else {
		// create new interval and set it to the end
		this.interval = new interval(
			table.getValue(0, 0),
			table.getValue(table.getNumberOfRows() - 1, 0),
			60
		);

		this.interval.setToEnd();
	}
}

this.initialize = function(file, table, options) {
	//this.filter.setOptions(options);
	this.setInterval(file, table);
	this.interval.toRangeFilter(this.filter);
	this.isDisplayed = true;

	google.visualization.events.addListener(this.filter, 'error', helper.errorHandler);
}

this.filter = new google.visualization.ControlWrapper(options);
this.initialize(file, table, options);

}