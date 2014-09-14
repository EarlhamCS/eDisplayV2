interval = function(start, end, interval) {
	dayToMs = 86400000; // number of ms in a day

	this.isDate = start instanceof Date;

	this.maximized = false;	
	this.start = start;
	this.end = end;

	this.original_start = start;
	this.original_end = end;
	
	this.stored_start = start;
	this.stored_end = end;

	this.interval = interval;

	this.setInterval = function(interval) {
		this.interval = interval;
		
		this.bind();
	}

	this.setIntervalToRange = function() {
		if(this.isDate) {
			var r = this.range() / dayToMs;
			this.setInterval(r);
		} else {
			this.setInterval(this.range());
		}
	}
	
	this.setBounds = function(start, end) {
		this.original_start = start;
		this.original_end = end;

		this.setIntervalToRange();
		this.bind();
	}
	
	this.setRange = function(start, end) {
		this.start = start;
		this.end = end;

		this.setIntervalToRange();
		this.bind();
	}

	this.bounds = function() {
		return this.original_end - this.original_start;
	}
	
	this.range = function() {
		return this.end - this.start;
	}

	this.move = function(amount) {		
		if(this.isDate) {
			this.start = dateAdd(this.start, amount);
		} else {
			this.start += amount;
		}

		this.bind();
	}

	this.step = function(multiple) {
		var r = this.interval * multiple;

		this.move(r)
	}
	
	this.setToPercentage = function(percentage) {
		var r = this.bounds() * percentage;
		
		if(this.isDate)
			this.start = dateAdd(this.original_start, (r / dayToMs));
		else
			this.start = this.original_start + r;
			
		this.bind();
	}
	
	this.setToStart = function() {
		this.setToPercentage(0);
	}
	
	this.setToEnd = function() {
		this.setToPercentage(1);
	}

	this.setMaximize = function(state) {
		this.maximize = state;
		
		if(this.maximize) {
			this.store();
			this.setRange(this.original_start, this.original_end);
		} else {
			this.restore();
		}
	}

	this.maximizeToggle = function() {
		this.setMaximize(!this.maximize);
	}
	
	this.reset = function() {
		this.start = this.original_start;
		this.end = this.original_end;
	}
	
	this.store = function() {
		this.stored_start = this.start;
		this.stored_end = this.end;
	}
	
	this.restore = function() {
		this.setRange(this.stored_start, this.stored_end);
	}
	
	this.toRangeFilter = function(range_filter) {
		var new_state = {
			range:{
				start: this.start,
				end: this.end
			}
		};
		
		range_filter.setState(new_state);
	}
	
	this.fromRangeFilter = function(range_filter) {
		var state = range_filter.getState();

		this.setRange(state.range.start, state.range.end);
	}

	this.bind = function() {
		if(this.isDate) {
			this.end = dateAdd(this.start, this.interval);
			
			if(this.start < this.original_start) {
				this.start = this.original_start;
				this.end = dateAdd(this.original_start, this.interval);
			}
			
			if(this.end > this.original_end) {
				this.start = dateAdd(this.original_end, -this.interval);
				this.end = this.original_end;
			}
		} else {
			this.end = this.start + this.interval;
			
			if(this.start < this.original_start) {
				this.start = this.original_start;
				this.end = this.original_start + this.interval;
			}
			
			if(this.end > this.original_end) {
				this.start = this.original_end - this.interval;
				this.end = this.original_end;
			}
		}
	}

	dateAdd = function(date, amount) {
		return new Date((date.getTime()/dayToMs + amount)*dayToMs);		
	}

	this.bind();
};

